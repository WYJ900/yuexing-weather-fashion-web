import http from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { extname, join, resolve } from 'node:path';
import Database from 'better-sqlite3';

const env = loadEnv();
const PORT = Number(process.env.PORT || env.PORT || 8787);
const DATA_DIR = join(process.cwd(), 'data');
const DIST_DIR = join(process.cwd(), 'dist');
const INDEX_FILE = join(DIST_DIR, 'index.html');
const UPLOAD_DIR = join(DATA_DIR, 'uploads');
const SESSION_TTL_DAYS = 30;
const MAX_REQUEST_BYTES = 2.5 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_BYTES = 1.5 * 1024 * 1024;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const SESSION_COOKIE_NAME = 'yx_session';
const DEFAULT_AI_BASE_URL = 'https://api.deepseek.com/v1';
const DEFAULT_AI_MODEL = 'deepseek-chat';
const AI_PLACEHOLDER_KEYS = new Set([
  'your_openai_compatible_key_here',
  'your_deepseek_or_openai_compatible_key_here',
]);
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]);
const demoAccount = {
  userId: 'demo',
  username: 'demo',
  password: 'Yuexing@2026',
  name: '演示体验账号',
};
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const allowedOrigins = buildAllowedOrigins();
const db = initDb();
const rateLimitStore = new Map();
const failedAuthStore = new Map();

function loadEnv() {
  const file = join(process.cwd(), '.env');
  if (!existsSync(file)) return {};
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const [key, ...rest] = line.split('=');
      acc[key.trim()] = rest.join('=').trim();
      return acc;
    }, {});
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildAllowedOrigins() {
  const configuredOrigins = String(process.env.CORS_ORIGINS || env.CORS_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const origins = new Set(configuredOrigins);
  if (!origins.size) {
    DEFAULT_ALLOWED_ORIGINS.forEach((origin) => origins.add(origin));
  }
  return origins;
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function sendEmpty(res, status = 204, headers = {}) {
  res.writeHead(status, headers);
  res.end();
}

function sendFile(res, filePath) {
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': contentType });
  res.end(readFileSync(filePath));
}

function getRequestOrigin(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!host) return '';
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const proto = forwardedProto || (req.socket.encrypted ? 'https' : 'http');
  return `${proto}://${host}`;
}

function isAllowedOrigin(req, origin) {
  if (!origin) return true;
  return origin === getRequestOrigin(req) || allowedOrigins.has(origin);
}

function applyCorsHeaders(req, res) {
  const origin = String(req.headers.origin || '').trim();
  if (!origin || !isAllowedOrigin(req, origin)) return;
  res.setHeader('access-control-allow-origin', origin);
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type,x-ai-base-url,x-ai-model,x-ai-api-key');
  res.setHeader('vary', 'Origin');
}

function hasColumn(database, table, column) {
  return database.prepare(`PRAGMA table_info(${table})`).all().some((item) => item.name === column);
}

function ensureColumn(database, table, column, definition) {
  if (!hasColumn(database, table, column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function initDb() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const database = new Database(join(DATA_DIR, 'yuexing.sqlite'));
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      place TEXT NOT NULL,
      trip_date TEXT NOT NULL,
      weather_snapshot TEXT,
      mood TEXT,
      scene TEXT,
      transport TEXT,
      content TEXT,
      photo TEXT,
      tags TEXT,
      ai_summary TEXT,
      emotion_review TEXT,
      next_suggestion TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS journal_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_type TEXT NOT NULL,
      period_key TEXT NOT NULL,
      stats_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      suggestions TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, period_type, period_key)
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT '',
      password_hash TEXT,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);
  ensureColumn(database, 'users', 'password_hash', 'TEXT');
  upgradeLegacyUsers(database);
  seedUsers(database);
  seedJournal(database);
  return database;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || !passwordHash.startsWith('scrypt$')) return false;
  const [, salt, storedHash] = passwordHash.split('$');
  const computedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  return storedBuffer.length === computedHash.length && timingSafeEqual(storedBuffer, computedHash);
}

function normalizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.display_name,
  };
}

function upgradeLegacyUsers(database) {
  const users = database.prepare('SELECT id, password, password_hash FROM users').all();
  const update = database.prepare('UPDATE users SET password_hash = @password_hash WHERE id = @id');
  users.forEach((user) => {
    if (!user.password_hash && user.password) {
      update.run({ id: user.id, password_hash: hashPassword(user.password) });
    }
  });
}

function seedUsers(database) {
  const existing = database.prepare('SELECT id FROM users WHERE username = ?').get(demoAccount.username);
  if (existing) return;
  database.prepare(`
    INSERT INTO users (id, username, password, password_hash, display_name, created_at)
    VALUES (@id, @username, @password, @password_hash, @display_name, @created_at)
  `).run({
    id: demoAccount.userId,
    username: demoAccount.username,
    password: '',
    password_hash: hashPassword(demoAccount.password),
    display_name: demoAccount.name,
    created_at: new Date().toISOString(),
  });
}

function createSession(userId) {
  const token = randomBytes(24).toString('hex');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (@token, @user_id, @created_at, @expires_at)
  `).run({
    token,
    user_id: userId,
    created_at: createdAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  return token;
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const index = item.indexOf('=');
      if (index <= 0) return acc;
      acc[item.slice(0, index).trim()] = decodeURIComponent(item.slice(index + 1).trim());
      return acc;
    }, {});
}

function isSecureRequest(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  return forwardedProto === 'https' || Boolean(req.socket.encrypted);
}

function serializeSessionCookie(token, req, maxAgeSeconds = SESSION_TTL_DAYS * 24 * 60 * 60) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

function serializeClearedSessionCookie(req) {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

function getSessionByToken(token) {
  const session = db.prepare(`
    SELECT sessions.token, sessions.created_at, sessions.expires_at,
           users.id, users.username, users.display_name
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ?
  `).get(token);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return {
    token: session.token,
    createdAt: session.created_at,
    expiresAt: session.expires_at,
    user: {
      id: session.id,
      username: session.username,
      name: session.display_name,
    },
  };
}

function destroySession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function parseAuthToken(req) {
  const cookies = parseCookies(req);
  if (cookies[SESSION_COOKIE_NAME]) return cookies[SESSION_COOKIE_NAME];
  const header = String(req.headers.authorization || '').trim();
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return String(req.headers['x-session-token'] || '').trim();
}

function requireSession(req) {
  const token = parseAuthToken(req);
  if (!token) throw createError(401, '请先登录后再继续。');
  const session = getSessionByToken(token);
  if (!session) throw createError(401, '登录状态已失效，请重新登录。');
  return session;
}

function sanitizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function takeRateLimitHit(store, key, limit, windowMs) {
  const now = Date.now();
  const current = store.get(key);
  const state = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;
  if (state.count >= limit) {
    store.set(key, state);
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }
  state.count += 1;
  store.set(key, state);
  return {
    allowed: true,
    retryAfter: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
  };
}

function clearRateLimit(store, key) {
  store.delete(key);
}

function enforceAuthRateLimit(req, action, limit) {
  const result = takeRateLimitHit(rateLimitStore, `${action}:${getClientIp(req)}`, limit, AUTH_WINDOW_MS);
  if (result.allowed) return;
  const error = createError(429, '请求过于频繁，请稍后再试。');
  error.headers = { 'retry-after': String(result.retryAfter) };
  throw error;
}

function recordFailedAuth(req, username) {
  if (!username) return;
  takeRateLimitHit(failedAuthStore, `${getClientIp(req)}:${username}`, 5, AUTH_WINDOW_MS);
}

function enforceFailedAuthGuard(req, username) {
  if (!username) return;
  const state = failedAuthStore.get(`${getClientIp(req)}:${username}`);
  if (!state || state.count < 5 || state.resetAt <= Date.now()) return;
  const error = createError(429, '登录失败次数过多，请稍后再试。');
  error.headers = { 'retry-after': String(Math.max(1, Math.ceil((state.resetAt - Date.now()) / 1000))) };
  throw error;
}

function clearFailedAuth(req, username) {
  if (!username) return;
  clearRateLimit(failedAuthStore, `${getClientIp(req)}:${username}`);
}

function registerUser(payload = {}) {
  const username = sanitizeUsername(payload.username);
  const password = String(payload.password || '');
  const displayName = String(payload.displayName || '').trim() || username;
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw createError(400, '账号需为 3-20 位字母、数字或下划线。');
  }
  if (password.length < 8) {
    throw createError(400, '密码至少需要 8 位。');
  }
  if (displayName.length < 2 || displayName.length > 24) {
    throw createError(400, '昵称需为 2-24 个字符。');
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) throw createError(409, '这个账号已经存在，请换一个用户名。');

  const user = {
    id: createId('user'),
    username,
    display_name: displayName,
    password: '',
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };
  db.prepare(`
    INSERT INTO users (id, username, password, password_hash, display_name, created_at)
    VALUES (@id, @username, @password, @password_hash, @display_name, @created_at)
  `).run(user);
  const token = createSession(user.id);
  return {
    ok: true,
    token,
    user: normalizeUser(user),
  };
}

function loginUser(payload = {}, req) {
  const username = sanitizeUsername(payload.username);
  const password = String(payload.password || '');
  enforceFailedAuthGuard(req, username);
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  const isValid = user && (
    verifyPassword(password, user.password_hash) ||
    (!user.password_hash && user.password === password)
  );
  if (!isValid) {
    recordFailedAuth(req, username);
    throw createError(401, '账号或密码不正确。');
  }
  clearFailedAuth(req, username);
  if (!user.password_hash && user.password) {
    db.prepare('UPDATE users SET password_hash = @password_hash WHERE id = @id').run({
      id: user.id,
      password_hash: hashPassword(password),
    });
  }
  const token = createSession(user.id);
  return {
    ok: true,
    token,
    user: normalizeUser(user),
  };
}

function seedJournal(database) {
  const count = database.prepare('SELECT COUNT(*) AS total FROM journal_entries WHERE user_id = ?').get(demoAccount.userId).total;
  if (count) return;
  const insert = database.prepare(`
    INSERT INTO journal_entries (
      id, user_id, title, place, trip_date, weather_snapshot, mood, scene, transport,
      content, photo, tags, ai_summary, emotion_review, next_suggestion, created_at
    ) VALUES (
      @id, @user_id, @title, @place, @trip_date, @weather_snapshot, @mood, @scene, @transport,
      @content, @photo, @tags, @ai_summary, @emotion_review, @next_suggestion, @created_at
    )
  `);
  [
    {
      title: '湖边散步',
      place: '校园湖边',
      trip_date: '2026-04-08',
      weather_snapshot: { weather: '多云', temp: 21, source: '演示样本' },
      mood: '松弛',
      scene: '休闲',
      transport: '步行',
      content: '傍晚去湖边走了一圈，风不大，整个人轻了很多。舒服的鞋子很重要。',
    },
    {
      title: '雨天通勤',
      place: '教学楼',
      trip_date: '2026-04-14',
      weather_snapshot: { weather: '雨天', temp: 17, source: '演示样本' },
      mood: '专注',
      scene: '上学',
      transport: '地铁',
      content: '下雨天路上有点赶，忘带纸巾和充电宝。下次雨天要提前出门。',
    },
    {
      title: '咖啡店复盘',
      place: '街角咖啡店',
      trip_date: '2026-04-21',
      weather_snapshot: { weather: '晴天', temp: 24, source: '演示样本' },
      mood: '温柔',
      scene: '约会',
      transport: '步行',
      content: '晴天很适合浅色外套，下午光线很好，适合轻便小包。',
    },
  ].forEach((entry) => {
    const analysis = localJournalAnalysis(entry);
    insert.run({
      id: createId('seed-journal'),
      user_id: demoAccount.userId,
      title: entry.title,
      place: entry.place,
      trip_date: entry.trip_date,
      weather_snapshot: JSON.stringify(entry.weather_snapshot),
      mood: entry.mood,
      scene: entry.scene,
      transport: entry.transport,
      content: entry.content,
      photo: '',
      tags: JSON.stringify(analysis.tags),
      ai_summary: analysis.summary,
      emotion_review: analysis.emotionReview,
      next_suggestion: analysis.nextSuggestion,
      created_at: new Date().toISOString(),
    });
  });
}

async function readJson(req) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_REQUEST_BYTES) {
      throw createError(413, '请求体过大，请压缩图片后重试。');
    }
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw createError(400, '请求体不是合法 JSON。');
  }
}

function persistJournalPhoto(photo) {
  const value = String(photo || '').trim();
  if (!value) return '';
  if (value.startsWith('/uploads/')) return value;
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw createError(400, '仅支持 JPG、PNG 或 WebP 图片。');
  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) return '';
  if (buffer.length > MAX_UPLOAD_IMAGE_BYTES) {
    throw createError(413, '图片过大，请控制在 1.5MB 以内。');
  }
  const filename = `${createId('journal-photo')}${imageExtensions[mimeType]}`;
  writeFileSync(join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function isPlaceholderAiKey(value) {
  return !String(value || '').trim() || AI_PLACEHOLDER_KEYS.has(String(value || '').trim());
}

function normalizeAiBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_AI_BASE_URL;
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw createError(400, '模型 Base URL 无效，请填写完整地址。');
  }
  const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !isLocalHttp) {
    throw createError(400, '模型 Base URL 仅支持 https，或 http://localhost 本地地址。');
  }
  return url.toString().replace(/\/$/, '');
}

function resolveAiRuntime(req) {
  const requestBaseUrl = String(req.headers['x-ai-base-url'] || '').trim();
  const requestModel = String(req.headers['x-ai-model'] || '').trim();
  const requestApiKey = String(req.headers['x-ai-api-key'] || '').trim();
  const hasRequestOverride = Boolean(requestBaseUrl || requestModel || requestApiKey);

  if (hasRequestOverride) {
    if (isPlaceholderAiKey(requestApiKey)) return null;
    return {
      source: 'request',
      baseUrl: normalizeAiBaseUrl(requestBaseUrl || process.env.AI_BASE_URL || env.AI_BASE_URL || DEFAULT_AI_BASE_URL),
      model: requestModel || process.env.AI_MODEL || env.AI_MODEL || DEFAULT_AI_MODEL,
      apiKey: requestApiKey,
    };
  }

  const envApiKey = String(process.env.AI_API_KEY || env.AI_API_KEY || '').trim();
  if (isPlaceholderAiKey(envApiKey)) return null;
  return {
    source: 'server-env',
    baseUrl: normalizeAiBaseUrl(process.env.AI_BASE_URL || env.AI_BASE_URL || DEFAULT_AI_BASE_URL),
    model: process.env.AI_MODEL || env.AI_MODEL || DEFAULT_AI_MODEL,
    apiKey: envApiKey,
  };
}

function localMood(text = '') {
  const value = String(text).toLowerCase();
  if (/(累|疲|困|压力|低落|down|tired|stress)/i.test(value)) {
    return { mood: '松弛', tags: ['舒适', '低饱和', '轻便'], explanation: '文本表达出疲惫或压力，映射为松弛舒适的穿搭需求。', source: 'local-fallback' };
  }
  if (/(开心|精神|活力|元气|bright|energy)/i.test(value)) {
    return { mood: '元气', tags: ['明亮', '轻快', '运动'], explanation: '文本表达积极能量，映射为元气明亮的穿搭需求。', source: 'local-fallback' };
  }
  if (/(会议|考试|面试|专注|正式|work|focus)/i.test(value)) {
    return { mood: '专注', tags: ['利落', '通勤', '黑白灰'], explanation: '文本表达任务感或正式场景，映射为专注利落的穿搭需求。', source: 'local-fallback' };
  }
  return { mood: '温柔', tags: ['温柔', '浅色系', '亲和'], explanation: '文本整体偏日常柔和，映射为温柔亲和的穿搭需求。', source: 'local-fallback' };
}

function localRecommend(payload = {}) {
  const conditions = payload.conditions || {};
  const baseLook = payload.baseLook || {};
  const pieces = Array.isArray(baseLook.pieces) ? baseLook.pieces : [];
  const pieceNames = pieces.map((item) => item.name).join('、') || '现有衣物';
  return {
    title: baseLook.title || 'AI 混合推荐 Look',
    reason: `${conditions.city || '当前城市'} ${conditions.weather || '今日天气'}、${conditions.temp || '--'} 摄氏度下，系统先用规则筛出 ${pieceNames}，再结合你的偏好与历史记录生成更贴近场景的搭配。`,
    sceneTips: `如果今天是${conditions.scene || '日常'}场景，建议把重点放在舒适度、行动便利和整体轮廓的完整度上。`,
    weatherTips: '根据实时天气，注意温度、降水和风速变化；雨天减少浅色拖地单品，冷天优先保留外套层次。',
    tags: ['规则筛选', '偏好学习', '本地智能'],
    confidence: 0.72,
    source: 'local-fallback',
  };
}

function localJournalAnalysis(payload = {}) {
  const text = `${payload.title || ''} ${payload.place || ''} ${payload.content || ''} ${payload.weather_snapshot?.weather || ''}`;
  const tags = new Set([
    payload.mood,
    payload.scene,
    payload.transport,
    payload.place,
    ...(payload.visualTags || []),
  ].filter(Boolean));
  if (payload.photoColor) tags.add(`${payload.photoColor}主色`);
  if (/湖|公园|自然|树|海|山|散步/.test(text)) tags.add('自然疗愈');
  if (/咖啡|商场|街|店/.test(text)) tags.add('城市漫游');
  if (/雨|淋|湿/.test(text)) tags.add('雨天敏感');
  if (/晒|热|闷/.test(text)) tags.add('怕热');
  if (/冷|风大|冻/.test(text)) tags.add('怕冷');
  if (/累|疲|困/.test(text)) tags.add('低负担');
  if (/忘带|充电宝|纸巾|伞/.test(text)) tags.add('物品提醒');
  if (/鞋|脚/.test(text)) tags.add('舒适鞋');
  const mainTag = Array.from(tags).filter(Boolean)[0] || '日常出行';
  return {
    tags: Array.from(tags).filter(Boolean).slice(0, 8),
    summary: `这次手记呈现出「${mainTag}」倾向，地点与天气共同影响了当天的出行体验。`,
    emotionReview: /开心|舒服|轻|治愈|很好/.test(text)
      ? '这次出行情绪反馈偏积极，适合沉淀为后续推荐的偏好样本。'
      : /累|烦|赶|忘带|冷|热|晒/.test(text)
        ? '这次出行暴露了负担点，系统会把它转化为下次的风险提醒。'
        : '这次记录提供了稳定的日常偏好信号，可用于完善用户画像。',
    nextSuggestion: /雨|忘带/.test(text)
      ? '下次类似天气建议提前出门，并优先提醒伞、纸巾和充电宝。'
      : /累|鞋|脚/.test(text)
        ? '下次长时间在外建议选择舒适鞋、轻便包，并减少不必要携带物。'
        : '下次相似行程可继续参考本次的天气、情绪和穿搭偏好。',
    source: 'local-fallback',
  };
}

function parseRow(row) {
  return {
    ...row,
    weather_snapshot: row.weather_snapshot ? JSON.parse(row.weather_snapshot) : null,
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

function getJournalEntries(userId) {
  return db.prepare('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY trip_date DESC, created_at DESC')
    .all(userId)
    .map(parseRow);
}

function buildProfileFromEntries(entries) {
  const add = (record, key) => {
    if (!key) return;
    record[key] = (record[key] || 0) + 1;
  };
  const profile = {
    place_preferences: {},
    weather_preferences: {},
    emotion_patterns: {},
    transport_preferences: {},
    scene_preferences: {},
    memory_keywords: {},
  };
  entries.forEach((entry) => {
    add(profile.place_preferences, entry.place);
    add(profile.weather_preferences, entry.weather_snapshot?.weather);
    add(profile.emotion_patterns, entry.mood);
    add(profile.transport_preferences, entry.transport);
    add(profile.scene_preferences, entry.scene);
    (entry.tags || []).forEach((tag) => add(profile.memory_keywords, tag));
  });
  return profile;
}

function topKeys(record, count = 5) {
  return Object.entries(record || {}).sort((a, b) => b[1] - a[1]).slice(0, count).map(([key]) => key);
}

function filterEntriesByPeriod(entries, period, key) {
  if (!period || !key) return entries;
  if (period === 'month') return entries.filter((entry) => entry.trip_date?.startsWith(key));
  if (period === 'year') return entries.filter((entry) => entry.trip_date?.startsWith(key));
  return entries;
}

function localJournalSummary(entries, period, key) {
  const profile = buildProfileFromEntries(entries);
  const topPlaces = topKeys(profile.place_preferences, 3);
  const topWeather = topKeys(profile.weather_preferences, 2);
  const topMood = topKeys(profile.emotion_patterns, 2);
  const topScenes = topKeys(profile.scene_preferences, 2);
  const topTransport = topKeys(profile.transport_preferences, 2);
  const topKeywords = topKeys(profile.memory_keywords, 6);
  const periodName = period === 'year' ? `${key} 年` : `${key} 月`;
  return {
    stats: {
      count: entries.length,
      topPlaces,
      topWeather,
      topMood,
      topScenes,
      topTransport,
      topKeywords,
      photos: entries.filter((entry) => entry.photo).map((entry) => entry.photo).slice(0, 8),
    },
    summary: `${periodName}共记录 ${entries.length} 次出行，常见地点是 ${topPlaces.join('、') || '暂无'}，常见天气是 ${topWeather.join('、') || '暂无'}，情绪关键词集中在 ${topMood.join('、') || '暂无'}。`,
    suggestions: topKeywords.includes('雨天敏感')
      ? '下个阶段遇到雨天时，系统会优先增加提前出门、防水鞋和伞具提醒。'
      : topKeywords.includes('低负担')
        ? '下个阶段建议继续降低出行负担，优先舒适鞋、轻便包和少换乘方案。'
        : '下个阶段可以继续记录地点、天气和情绪变化，让画像更稳定。',
  };
}

async function analyzeJournal(payload, aiRuntime) {
  const local = localJournalAnalysis(payload);
  const system = '你是“悦行天气”的行程手记分析 AI。只输出 JSON，字段必须包含 tags, summary, emotionReview, nextSuggestion。中文表达，具体、温暖、适合真实用户阅读。';
  const ai = await callCompatibleLLM([
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify({ task: '分析用户出行手记，提取标签、情绪复盘和下次建议。', payload }) },
  ], aiRuntime).catch(() => null);
  return ai ? { ...local, ...ai, source: 'ai-online' } : local;
}

async function createJournal(payload, userId, aiRuntime) {
  const entry = {
    id: createId('journal'),
    user_id: userId,
    title: payload.title || '未命名手记',
    place: payload.place || '未命名地点',
    trip_date: payload.tripDate || new Date().toISOString().slice(0, 10),
    weather_snapshot: payload.weatherSnapshot || null,
    mood: payload.mood || '松弛',
    scene: payload.scene || '休闲',
    transport: payload.transport || '步行',
    content: payload.content || '',
    photo: persistJournalPhoto(payload.photo),
    photoColor: payload.photoColor || '',
    visualTags: Array.isArray(payload.visualTags) ? payload.visualTags : [],
    created_at: new Date().toISOString(),
  };
  const analysis = await analyzeJournal(entry, aiRuntime);
  db.prepare(`
    INSERT INTO journal_entries (
      id, user_id, title, place, trip_date, weather_snapshot, mood, scene, transport,
      content, photo, tags, ai_summary, emotion_review, next_suggestion, created_at
    ) VALUES (
      @id, @user_id, @title, @place, @trip_date, @weather_snapshot, @mood, @scene, @transport,
      @content, @photo, @tags, @ai_summary, @emotion_review, @next_suggestion, @created_at
    )
  `).run({
    id: entry.id,
    user_id: entry.user_id,
    title: entry.title,
    place: entry.place,
    trip_date: entry.trip_date,
    weather_snapshot: JSON.stringify(entry.weather_snapshot),
    mood: entry.mood,
    scene: entry.scene,
    transport: entry.transport,
    content: entry.content,
    photo: entry.photo,
    tags: JSON.stringify(analysis.tags || []),
    ai_summary: analysis.summary,
    emotion_review: analysis.emotionReview,
    next_suggestion: analysis.nextSuggestion,
    created_at: entry.created_at,
  });
  return parseRow({
    ...entry,
    weather_snapshot: JSON.stringify(entry.weather_snapshot),
    tags: JSON.stringify(analysis.tags || []),
    ai_summary: analysis.summary,
    emotion_review: analysis.emotionReview,
    next_suggestion: analysis.nextSuggestion,
  });
}

async function getJournalSummary(userId, period, key, aiRuntime) {
  const entries = filterEntriesByPeriod(getJournalEntries(userId), period, key);
  const local = localJournalSummary(entries, period, key);
  const system = '你是“悦行天气”的月度或年度出行总结 AI。只输出 JSON，字段必须包含 summary, suggestions。中文表达，像真实产品里的个性总结，不要夸张。';
  const ai = await callCompatibleLLM([
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify({ period, key, stats: local.stats, entries: entries.slice(0, 12) }) },
  ], aiRuntime).catch(() => null);
  const result = ai ? { ...local, ...ai, source: 'ai-online' } : { ...local, source: 'local-fallback' };
  db.prepare(`
    INSERT INTO journal_insights (id, user_id, period_type, period_key, stats_json, summary, suggestions, created_at)
    VALUES (@id, @user_id, @period_type, @period_key, @stats_json, @summary, @suggestions, @created_at)
    ON CONFLICT(user_id, period_type, period_key)
    DO UPDATE SET stats_json = excluded.stats_json, summary = excluded.summary, suggestions = excluded.suggestions, created_at = excluded.created_at
  `).run({
    id: createId('insight'),
    user_id: userId,
    period_type: period,
    period_key: key,
    stats_json: JSON.stringify(result.stats),
    summary: result.summary,
    suggestions: result.suggestions,
    created_at: new Date().toISOString(),
  });
  return result;
}

async function callCompatibleLLM(messages, aiRuntime) {
  const runtime = aiRuntime || {
    baseUrl: normalizeAiBaseUrl(process.env.AI_BASE_URL || env.AI_BASE_URL || DEFAULT_AI_BASE_URL),
    apiKey: process.env.AI_API_KEY || env.AI_API_KEY,
    model: process.env.AI_MODEL || env.AI_MODEL || DEFAULT_AI_MODEL,
  };
  if (!runtime.baseUrl || isPlaceholderAiKey(runtime.apiKey)) return null;

  const response = await fetch(`${runtime.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${runtime.apiKey}`,
    },
    body: JSON.stringify({
      model: runtime.model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return content ? JSON.parse(content) : null;
}

async function recommend(payload, aiRuntime) {
  const system = '你是“悦行天气”的穿搭推荐 AI。只输出 JSON，不要 Markdown。字段必须包含 title, reason, sceneTips, weatherTips, tags, confidence。中文表达，具体、专业、自然。';
  const user = JSON.stringify({
    task: '基于规则筛选结果、真实天气、用户偏好和历史搭配，生成个性化穿搭理由和场景建议。',
    payload,
  });
  const ai = await callCompatibleLLM([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], aiRuntime).catch(() => null);
  return ai ? { ...ai, source: 'ai-online' } : localRecommend(payload);
}

async function mood(payload, aiRuntime) {
  const text = payload.text || '';
  const system = '你是情绪语义分类器。只输出 JSON，字段必须包含 mood, tags, explanation。mood 只能是 温柔、元气、松弛、专注 之一。';
  const ai = await callCompatibleLLM([
    { role: 'system', content: system },
    { role: 'user', content: `请分析这句话的穿搭情绪需求：${text}` },
  ], aiRuntime).catch(() => null);
  return ai ? { ...ai, source: 'ai-online' } : localMood(text);
}

function serveFrontend(req, res, pathname) {
  if (!existsSync(INDEX_FILE)) {
    sendJson(res, 404, { ok: false, error: '前端静态资源尚未构建，请先执行 npm run build。' });
    return true;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = resolve(DIST_DIR, relativePath);
  if (!filePath.startsWith(resolve(DIST_DIR))) {
    sendJson(res, 403, { ok: false, error: '非法路径。' });
    return true;
  }
  if (existsSync(filePath) && extname(filePath)) {
    sendFile(res, filePath);
    return true;
  }
  sendFile(res, INDEX_FILE);
  return true;
}

function serveUploads(res, pathname) {
  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = resolve(DATA_DIR, relativePath);
  if (!filePath.startsWith(resolve(UPLOAD_DIR))) {
    sendJson(res, 403, { ok: false, error: '非法路径。' });
    return true;
  }
  if (!existsSync(filePath)) {
    sendJson(res, 404, { ok: false, error: '图片不存在。' });
    return true;
  }
  sendFile(res, filePath);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    applyCorsHeaders(req, res);
    const requestOrigin = String(req.headers.origin || '').trim();
    if (requestOrigin && !isAllowedOrigin(req, requestOrigin)) {
      if (req.method === 'OPTIONS') {
        return sendJson(res, 403, { ok: false, error: '当前来源未被允许访问。' });
      }
      if (url.pathname.startsWith('/api/')) {
        throw createError(403, '当前来源未被允许访问。');
      }
    }
    if (req.method === 'OPTIONS') return sendEmpty(res, 204);

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      enforceAuthRateLimit(req, 'register', 5);
      const result = registerUser(await readJson(req));
      return sendJson(res, 200, { ok: true, user: result.user }, {
        'set-cookie': serializeSessionCookie(result.token, req),
      });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      enforceAuthRateLimit(req, 'login', 10);
      const result = loginUser(await readJson(req), req);
      return sendJson(res, 200, { ok: true, user: result.user }, {
        'set-cookie': serializeSessionCookie(result.token, req),
      });
    }
    if (req.method === 'GET' && url.pathname === '/api/auth/session') {
      const session = requireSession(req);
      return sendJson(res, 200, { ok: true, user: session.user });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = parseAuthToken(req);
      if (token) destroySession(token);
      return sendJson(res, 200, { ok: true }, {
        'set-cookie': serializeClearedSessionCookie(req),
      });
    }

    if (url.pathname.startsWith('/api/')) {
      if (req.method === 'GET' && url.pathname === '/api/health') {
        return sendJson(res, 200, {
          ok: true,
          service: 'yuexing-weather',
          aiConfigured: !isPlaceholderAiKey(process.env.AI_API_KEY || env.AI_API_KEY),
          supportsUserManagedAi: true,
        });
      }
      const session = requireSession(req);
      const aiRuntime = resolveAiRuntime(req);
      if (req.method === 'POST' && url.pathname === '/api/ai/recommend') {
        const payload = await readJson(req);
        return sendJson(res, 200, await recommend({ ...payload, user: session.user }, aiRuntime));
      }
      if (req.method === 'POST' && url.pathname === '/api/ai/mood') {
        return sendJson(res, 200, await mood(await readJson(req), aiRuntime));
      }
      if (req.method === 'POST' && url.pathname === '/api/journal/analyze') {
        return sendJson(res, 200, await analyzeJournal(await readJson(req), aiRuntime));
      }
      if (req.method === 'POST' && url.pathname === '/api/journal') {
        return sendJson(res, 200, await createJournal(await readJson(req), session.user.id, aiRuntime));
      }
      if (req.method === 'GET' && url.pathname === '/api/journal') {
        return sendJson(res, 200, {
          entries: getJournalEntries(session.user.id),
        });
      }
      if (req.method === 'GET' && url.pathname === '/api/journal/summary') {
        return sendJson(res, 200, await getJournalSummary(
          session.user.id,
          url.searchParams.get('period') || 'month',
          url.searchParams.get('key') || new Date().toISOString().slice(0, 7),
          aiRuntime,
        ));
      }
      if (req.method === 'POST' && url.pathname === '/api/profile/rebuild') {
        const entries = getJournalEntries(session.user.id);
        return sendJson(res, 200, {
          userId: session.user.id,
          profile: buildProfileFromEntries(entries),
          source: 'journal-learning',
        });
      }
      return sendJson(res, 404, { ok: false, error: '接口不存在。' });
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/uploads/')) {
      return serveUploads(res, url.pathname);
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      return serveFrontend(req, res, url.pathname);
    }
    return sendJson(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || '服务器开小差了，请稍后再试。',
    }, error.headers || {});
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yuexing Weather ready at http://0.0.0.0:${PORT}`);
});
