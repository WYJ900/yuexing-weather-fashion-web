import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Heart,
  LocateFixed,
  LogIn,
  MapPin,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/app', label: '今日行程' },
  { path: '/wardrobe', label: '我的衣柜' },
  { path: '/journal', label: '我的手记' },
  { path: '/profile', label: '个性画像' },
  { path: '/about', label: '作品说明' },
];
const publicNavItems = [
  { path: '/login', label: '登录' },
  { path: '/about', label: '作品说明' },
];

const protectedPaths = ['/app', '/wardrobe', '/journal', '/profile'];
const demoCredentials = { username: 'demo', password: 'Yuexing@2026' };
const MAX_CLIENT_IMAGE_BYTES = 1.5 * 1024 * 1024;
const clientStorageKeys = {
  wardrobe: 'wardrobe',
  tags: 'tags',
  conditions: 'conditions',
  lookHistory: 'look-history',
  weatherLocation: 'weather-location',
  aiRecommendation: 'ai-recommendation',
  preferenceWeights: 'preference-weights',
  wardrobeVersion: 'wardrobe-version',
};
const clientSessionKeys = {
  aiRuntime: 'ai-runtime',
};
const defaultAiRuntimeConfig = {
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  apiKey: '',
};

const slides = [
  {
    title: 'City Soft Look',
    mood: '轻盈通勤',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=88',
  },
  {
    title: 'Date Mood',
    mood: '温柔约会',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=88',
  },
  {
    title: 'Campus Ease',
    mood: '校园松弛',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88',
  },
  {
    title: 'Coat Rhythm',
    mood: '利落通勤',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=88',
  },
  {
    title: 'Quiet Luxury',
    mood: '低调精致',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=88',
  },
  {
    title: 'Soft Street',
    mood: '日常轻街头',
    image:
      'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=1400&q=88',
  },
];

const defaultWardrobe = [
  {
    id: 'seed-knit',
    name: '月白短款针织',
    type: '上衣',
    color: '白色',
    season: '春秋',
    style: '温柔',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-cami',
    name: '花影吊带上衣',
    type: '上衣',
    color: '碎花',
    season: '夏季',
    style: '清新',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-tee',
    name: '黑色短袖 T',
    type: '上衣',
    color: '黑色',
    season: '四季',
    style: '街头',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-skirt',
    name: '雾粉半身裙',
    type: '下装',
    color: '粉色',
    season: '春秋',
    style: '浪漫',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-jeans',
    name: '浅蓝牛仔裤',
    type: '下装',
    color: '蓝色',
    season: '四季',
    style: '休闲',
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-pants',
    name: '奶油阔腿裤',
    type: '下装',
    color: '米色',
    season: '春秋',
    style: '通勤',
    image:
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-coat',
    name: '薄雾风衣',
    type: '外套',
    color: '米色',
    season: '春秋',
    style: '通勤',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-burgundy',
    name: '酒红短外套搭配',
    type: '外套',
    color: '红色',
    season: '冬季',
    style: '复古',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-blazer',
    name: '灰调西装',
    type: '外套',
    color: '灰色',
    season: '春秋',
    style: '利落',
    image:
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-loafers',
    name: '奶油乐福鞋搭配',
    type: '鞋子',
    color: '米色',
    season: '四季',
    style: '轻便',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-heels',
    name: '碎花高跟鞋搭配',
    type: '鞋子',
    color: '彩色',
    season: '四季',
    style: '精致',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-sneakers',
    name: '白色运动鞋搭配',
    type: '鞋子',
    color: '白色',
    season: '四季',
    style: '轻便',
    image:
      'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-pearl',
    name: '珍珠耳饰搭配',
    type: '配饰',
    color: '白色',
    season: '四季',
    style: '精致',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=86',
  },
  {
    id: 'seed-bag',
    name: '酒红小包搭配',
    type: '配饰',
    color: '红色',
    season: '四季',
    style: '约会',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=86',
  },
];

const DEFAULT_WARDROBE_VERSION = '2026-04-23-lookbook-v2';
const demoPreferences = ['温柔', '通勤', '图书馆', '浅色系', '低负担', '舒适鞋'];
const demoWeatherLocation = {
  city: '北京',
  latitude: 39.9042,
  longitude: 116.4074,
};
const defaultPreferences = ['温柔', '浅色系', '约会', '春秋', '轻通勤'];
const wardrobeTypes = ['上衣', '下装', '外套', '鞋子', '配饰'];
const wardrobeTypeMeta = {
  上衣: { color: '#e8c9bd', hint: '针织 / 衬衫 / T 恤' },
  下装: { color: '#e7b7c4', hint: '半身裙 / 牛仔 / 阔腿裤' },
  外套: { color: '#d8c0a4', hint: '风衣 / 西装 / 短外套' },
  鞋子: { color: '#cfd3ad', hint: '乐福鞋 / 高跟鞋 / 运动鞋' },
  配饰: { color: '#d9ccd8', hint: '包袋 / 耳饰 / 丝巾' },
};
const weatherOptions = ['晴天', '多云', '阴天', '雨天', '雪天'];
const moodOptions = ['温柔', '元气', '松弛', '专注'];
const sceneOptions = ['上学', '通勤', '约会', '休闲'];
const tripSceneOptions = ['上学', '通勤', '约会', '运动', '社团', '面试', '短途旅行', '休闲'];
const transportOptions = ['步行', '骑行', '公交', '地铁', '打车', '自驾'];
const colorOptions = ['白色', '黑色', '灰色', '米色', '粉色', '蓝色', '红色', '碎花', '彩色'];
const seasonOptions = ['春秋', '夏季', '冬季', '四季'];
const defaultWardrobeMap = defaultWardrobe.reduce((record, item) => {
  record[item.id] = item;
  return record;
}, {});

const quizQuestions = [
  {
    question: '今天你更想呈现哪种状态？',
    options: moodOptions,
  },
  {
    question: '你最常出现在哪类场景？',
    options: sceneOptions,
  },
  {
    question: '你偏爱的颜色气质是？',
    options: ['浅色系', '黑白灰', '复古红', '低饱和'],
  },
];

const pageNames = {
  '/': { en: 'HOME', cn: '首页' },
  '/login': { en: 'SIGN IN', cn: '登录' },
  '/app': { en: 'DAILY TRIP', cn: '今日行程' },
  '/wardrobe': { en: 'WARDROBE', cn: '我的衣柜' },
  '/journal': { en: 'TRAVEL MEMORY', cn: '我的手记' },
  '/profile': { en: 'PROFILE', cn: '个性画像' },
  '/about': { en: 'CONCEPT', cn: '作品说明' },
};

const defaultConditions = {
  weather: '晴天',
  temp: 24,
  mood: '温柔',
  scene: '约会',
  city: '北京',
  latitude: 39.9042,
  longitude: 116.4074,
  humidity: 42,
  wind: 8,
  precipitation: 0,
  weatherCode: 0,
  locationLabel: '北京',
  coordinateLabel: '39.904°N / 116.407°E',
  weatherUpdatedAt: '',
  source: '待接入实时天气',
  weatherSource: '默认城市',
  manualWeatherAdjusted: false,
};

const demoLookHistory = [
  {
    id: 'demo-look-1',
    title: '图书馆轻通勤',
    savedAt: '2026-04-08T08:10:00+08:00',
    conditions: {
      ...defaultConditions,
      weather: '多云',
      temp: 22,
      mood: '专注',
      scene: '通勤',
      tripScene: '上学',
      transport: '地铁',
      season: '春秋',
    },
    tripPlan: {
      title: '图书馆轻通勤',
    },
    pieces: ['seed-knit', 'seed-pants', 'seed-coat', 'seed-loafers', 'seed-bag'],
  },
  {
    id: 'demo-look-2',
    title: '周末咖啡散步',
    savedAt: '2026-04-20T15:20:00+08:00',
    conditions: {
      ...defaultConditions,
      weather: '晴天',
      temp: 25,
      mood: '温柔',
      scene: '约会',
      tripScene: '休闲',
      transport: '步行',
      season: '春秋',
    },
    tripPlan: {
      title: '周末咖啡散步',
    },
    pieces: ['seed-cami', 'seed-skirt', 'seed-burgundy', 'seed-heels', 'seed-pearl'],
  },
];

function getPath() {
  return window.location.pathname || '/';
}

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readSessionStored(key, fallback) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveSessionStored(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function removeStored(key) {
  localStorage.removeItem(key);
}

function removeSessionStored(key) {
  sessionStorage.removeItem(key);
}

function buildScopedStorageKey(scope, key) {
  return `yx:${scope}:${key}`;
}

function getStorageScope(user) {
  return user?.id || 'guest';
}

function readScopedStored(scope, key, fallback) {
  return readStored(buildScopedStorageKey(scope, key), fallback);
}

function saveScopedStored(scope, key, value) {
  saveStored(buildScopedStorageKey(scope, key), value);
}

function readScopedSessionStored(scope, key, fallback) {
  return readSessionStored(buildScopedStorageKey(scope, key), fallback);
}

function saveScopedSessionStored(scope, key, value) {
  saveSessionStored(buildScopedStorageKey(scope, key), value);
}

function removeScopedSessionStored(scope, key) {
  removeSessionStored(buildScopedStorageKey(scope, key));
}

function validateImageFile(file) {
  if (!file) return '请选择图片文件。';
  if (!String(file.type || '').startsWith('image/')) return '只支持图片文件。';
  if (file.size > MAX_CLIENT_IMAGE_BYTES) return '图片请控制在 1.5MB 以内。';
  return '';
}

function sanitizeAiRuntimeConfig(config = {}) {
  return {
    baseUrl: String(config.baseUrl || '').trim() || defaultAiRuntimeConfig.baseUrl,
    model: String(config.model || '').trim() || defaultAiRuntimeConfig.model,
    apiKey: String(config.apiKey || '').trim(),
  };
}

function hasAiRuntimeSecret(config = {}) {
  return Boolean(String(config.apiKey || '').trim());
}

function buildAiRuntimeHeaders(config = {}) {
  const runtime = sanitizeAiRuntimeConfig(config);
  return {
    'x-ai-base-url': runtime.baseUrl,
    'x-ai-model': runtime.model,
    'x-ai-api-key': runtime.apiKey,
  };
}

async function apiRequest(url, options = {}) {
  const { headers = {}, body, ...rest } = options;
  const nextHeaders = { ...headers };
  if (body && !nextHeaders['content-type']) nextHeaders['content-type'] = 'application/json';
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...rest,
    headers: nextHeaders,
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const error = new Error(data.error || '请求失败，请稍后再试。');
    error.status = response.status;
    throw error;
  }
  return data;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSeason(temp) {
  if (temp >= 28) return '夏季';
  if (temp < 18) return '冬季';
  return '春秋';
}

function weatherCodeToLabel(code) {
  if ([0, 1].includes(code)) return '晴天';
  if ([2].includes(code)) return '多云';
  if ([3, 45, 48].includes(code)) return '阴天';
  if (code >= 71 && code <= 86) return '雪天';
  if ((code >= 51 && code <= 82) || [95, 96, 99].includes(code)) return '雨天';
  return '多云';
}

function formatWeatherTime(value) {
  if (!value) return '正在同步';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚更新';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatCoordinate(value, type) {
  const suffix = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(Number(value || 0)).toFixed(3)}°${suffix}`;
}

function formatCoordinatePair(latitude, longitude) {
  return `${formatCoordinate(latitude, 'lat')} / ${formatCoordinate(longitude, 'lng')}`;
}

function isWeatherFresh(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 45 * 60 * 1000;
}

function buildRecommendationKey(look, conditions) {
  return [
    conditions.city,
    conditions.weather,
    conditions.temp,
    conditions.mood,
    conditions.scene,
    look.pieces.map((item) => item.id).join(','),
  ].join('|');
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function formatLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function getCurrentMonthKey(date = new Date()) {
  return formatLocalDate(date).slice(0, 7);
}

function getCurrentYearKey(date = new Date()) {
  return formatLocalDate(date).slice(0, 4);
}

function countBy(items, getter) {
  return items.reduce((record, item) => {
    const key = getter(item);
    if (!key) return record;
    record[key] = (record[key] || 0) + 1;
    return record;
  }, {});
}

function computeJournalProfile(entries = []) {
  return {
    places: countBy(entries, (entry) => entry.place),
    weather: countBy(entries, (entry) => entry.weather_snapshot?.weather),
    moods: countBy(entries, (entry) => entry.mood),
    scenes: countBy(entries, (entry) => entry.scene),
    transports: countBy(entries, (entry) => entry.transport),
    keywords: entries.reduce((record, entry) => {
      (entry.tags || []).forEach((tag) => {
        record[tag] = (record[tag] || 0) + 1;
      });
      return record;
    }, {}),
  };
}

function buildPhotoTags(colorName, entry = {}) {
  const text = `${entry.title || ''} ${entry.place || ''} ${entry.content || ''}`;
  const tags = new Set();
  if (colorName) tags.add(`${colorName}主色`);
  if (/湖|公园|树|自然|山|海|草地/.test(text)) tags.add('自然场景');
  if (/咖啡|店|街|商场|地铁|城市/.test(text)) tags.add('城市场景');
  if (/校园|教学楼|图书馆|上课/.test(text)) tags.add('校园场景');
  if (/傍晚|夕阳|夜|晚/.test(text)) tags.add('低光时段');
  return Array.from(tags).slice(0, 5);
}

function localJournalAnalysis(entry = {}) {
  const text = `${entry.title || ''} ${entry.place || ''} ${entry.content || ''} ${entry.weather_snapshot?.weather || ''}`;
  const tags = new Set([
    entry.mood,
    entry.scene,
    entry.transport,
    entry.place,
    ...(entry.visualTags || []),
  ].filter(Boolean));
  if (entry.photoColor) tags.add(`${entry.photoColor}主色`);
  if (/湖|公园|自然|树|海|山|散步/.test(text)) tags.add('自然疗愈');
  if (/咖啡|商场|街|店/.test(text)) tags.add('城市漫游');
  if (/雨|淋|湿/.test(text)) tags.add('雨天敏感');
  if (/晒|热|闷/.test(text)) tags.add('怕热');
  if (/冷|风大|冻/.test(text)) tags.add('怕冷');
  if (/累|疲|困/.test(text)) tags.add('低负担');
  if (/忘带|充电宝|纸巾|伞/.test(text)) tags.add('物品提醒');
  if (/鞋|脚/.test(text)) tags.add('舒适鞋');
  const tagList = Array.from(tags).filter(Boolean).slice(0, 8);
  return {
    tags: tagList,
    summary: `这次手记沉淀了「${tagList[0] || '日常出行'}」偏好，可用于下一次行程推荐。`,
    emotionReview: /开心|舒服|轻|治愈|很好/.test(text)
      ? '这次出行反馈偏积极，适合强化为后续推荐样本。'
      : /累|烦|赶|忘带|冷|热|晒/.test(text)
        ? '这次出行出现了负担点，系统会把它转化为下次的风险提醒。'
        : '这次记录提供了稳定的日常偏好信号。',
    nextSuggestion: /雨|忘带/.test(text)
      ? '下次类似天气优先提醒伞、纸巾、充电宝和提前出门。'
      : /累|鞋|脚/.test(text)
        ? '下次长时间在外建议选择舒适鞋、轻便包，并减少不必要携带物。'
        : '下次相似行程可继续参考本次的地点、天气和情绪偏好。',
    source: 'local-fallback',
  };
}

function localJournalSummary(entries = [], period, key) {
  const profile = computeJournalProfile(entries);
  const photos = entries.filter((entry) => entry.photo).map((entry) => entry.photo).slice(0, 8);
  const stats = {
    count: entries.length,
    topPlaces: topEntries(profile.places),
    topWeather: topEntries(profile.weather),
    topMood: topEntries(profile.moods),
    topScenes: topEntries(profile.scenes),
    topTransport: topEntries(profile.transports),
    topKeywords: topEntries(profile.keywords, 6),
    photos,
  };
  return {
    stats,
    summary: `${period === 'year' ? `${key} 年` : `${key} 月`}共记录 ${entries.length} 次出行，常去地点是 ${stats.topPlaces.join('、') || '暂无'}，常见天气是 ${stats.topWeather.join('、') || '暂无'}。`,
    suggestions: stats.topKeywords.includes('雨天敏感')
      ? '下个阶段遇到雨天时，优先增加提前出门、防水鞋和伞具提醒。'
      : stats.topKeywords.includes('低负担')
        ? '下个阶段建议继续降低出行负担，优先舒适鞋、轻便包和少换乘方案。'
        : '继续记录地点、天气和情绪变化，画像会更稳定。',
    source: 'local-fallback',
  };
}

function buildTripPlan(conditions, look, journalProfile = {}) {
  const weather = conditions.weather;
  const transport = conditions.transport || '步行';
  const scene = conditions.tripScene || conditions.scene;
  const duration = Number(conditions.duration || 4);
  const topPlaces = topEntries(journalProfile.places || {});
  const topKeywords = topEntries(journalProfile.keywords || {}, 5);
  const topWeather = topEntries(journalProfile.weather || {});
  const topMood = topEntries(journalProfile.moods || {});
  const buffer = (weather === '雨天' ? 15 : 0) + (weather === '雪天' ? 20 : 0) + (scene === '面试' ? 20 : 8);
  const carry = new Set(['手机', '纸巾']);
  if (duration >= 4) carry.add('充电宝');
  if (['雨天', '雪天'].includes(weather)) carry.add('雨伞');
  if (conditions.temp >= 28) {
    carry.add('水杯');
    carry.add('防晒');
  }
  if (scene === '面试') carry.add('证件 / 材料');
  if (topKeywords.includes('物品提醒')) carry.add('充电宝');
  if (topKeywords.includes('舒适鞋') || topKeywords.includes('低负担')) carry.add('舒适鞋');
  const riskScore = clamp(
    (['雨天', '雪天'].includes(weather) ? 28 : 10) +
      (duration >= 6 ? 18 : 6) +
      (topKeywords.includes('低负担') ? 16 : 0) +
      (topKeywords.includes('雨天敏感') ? 14 : 0),
    0,
    100,
  );
  const comfortScore = clamp(
    78 +
      (topKeywords.includes('舒适鞋') ? 8 : 0) -
      (duration >= 8 ? 10 : 0) -
      (conditions.temp >= 30 ? 8 : 0),
    0,
    100,
  );
  const memoryHint = topPlaces[0]
    ? `你的手记里常出现「${topPlaces[0]}」和「${topKeywords[0] || '日常出行'}」，本次建议保留低负担准备。`
    : '保存手记后，这里会引用你的地点、天气和情绪记忆。';
  const evidence = [
    `天气依据：${conditions.city || '当前城市'} ${weather}，${conditions.temp} 摄氏度，系统据此调整提前量和携带物。`,
    `情绪依据：当前状态偏「${conditions.mood}」，行程语气会更接近你的当日状态。`,
    `衣柜依据：已选 ${look.pieces.length} 件衣物，优先匹配 ${look.season}、场景和历史风格。`,
    topPlaces[0]
      ? `手记依据：常去「${topPlaces[0]}」，常见天气「${topWeather[0] || '--'}」，常见情绪「${topMood[0] || '--'}」。`
      : '手记依据：新增手记后会沉淀地点、天气、情绪和出行方式偏好。',
  ];
  return {
    title: `${scene}${weather}出行方案`,
    strategy: `${transport}优先，建议额外预留 ${buffer} 分钟。${weather === '雨天' ? '雨天减少骑行和浅色鞋包。' : ''}`,
    moodAdvice: conditions.mood === '松弛'
      ? '今天适合减少临时决策，把携带物和路线做得简单。'
      : conditions.mood === '专注'
        ? '今天把准点和形象稳定放在第一位。'
        : '今天可以保持轻快节奏，让穿搭和行程更有精神感。',
    carry: Array.from(carry),
    memoryHint,
    riskScore,
    comfortScore,
    evidence,
    outfit: look.pieces.map((item) => item.name).join(' / '),
  };
}

function colorDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2,
  );
}

function rgbToColorName([r, g, b]) {
  const palette = [
    ['白色', [245, 241, 232]],
    ['黑色', [24, 22, 22]],
    ['灰色', [132, 128, 124]],
    ['米色', [218, 196, 164]],
    ['粉色', [225, 150, 170]],
    ['蓝色', [92, 137, 178]],
    ['红色', [150, 35, 54]],
    ['绿色', [97, 122, 76]],
    ['彩色', [180, 120, 80]],
  ];
  return palette
    .map(([name, rgb]) => ({ name, score: colorDistance([r, g, b], rgb) }))
    .sort((a, b) => a.score - b.score)[0].name;
}

function inferStyleFromUpload(type, fileName, color) {
  const text = `${fileName} ${type} ${color}`.toLowerCase();
  if (/(work|office|通勤|西装|衬衫|风衣)/i.test(text)) return '通勤';
  if (/(date|约会|裙|高跟|珍珠|红)/i.test(text)) return '约会';
  if (/(sport|运动|sneaker|卫衣|t恤|tee)/i.test(text)) return '元气';
  if (/(black|黑|street|牛仔)/i.test(text)) return '街头';
  if (['白色', '米色', '粉色'].includes(color)) return '温柔';
  return '精致';
}

function localMoodFromText(text = '') {
  if (/(累|疲|困|压力|低落|放松|tired|stress)/i.test(text)) {
    return { mood: '松弛', tags: ['舒适', '低饱和', '轻便'], explanation: '本地语义识别到疲惫或压力，推荐更舒适松弛的 Look。', source: 'local-fallback' };
  }
  if (/(开心|精神|活力|元气|明亮|energy|happy)/i.test(text)) {
    return { mood: '元气', tags: ['明亮', '运动', '轻快'], explanation: '本地语义识别到积极能量，推荐更明亮有活力的 Look。', source: 'local-fallback' };
  }
  if (/(会议|考试|面试|专注|正式|工作|focus|work)/i.test(text)) {
    return { mood: '专注', tags: ['利落', '通勤', '黑白灰'], explanation: '本地语义识别到任务感，推荐更利落专注的 Look。', source: 'local-fallback' };
  }
  return { mood: '温柔', tags: ['温柔', '浅色系', '亲和'], explanation: '本地语义识别为日常温柔状态。', source: 'local-fallback' };
}

function localAiRecommendation(look, conditions, preferenceWeights = {}) {
  const city = conditions.city || '当前城市';
  const pieceNames = look.pieces.map((item) => item.name).join('、');
  const topStyle = Object.entries(preferenceWeights.styles || {}).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    title: look.title,
    reason: `${city}当前是${conditions.weather}，${conditions.temp} 摄氏度。系统先用季节、天气和衣柜规则筛出 ${pieceNames}，再参考你最近偏好的${topStyle || conditions.mood}气质，让搭配更像你的日常选择。`,
    sceneTips: `今天偏${conditions.scene}场景，建议保持动作便利：上半身有轮廓，下半身不过度拖沓，配饰只保留一个视觉重点。`,
    weatherTips: `湿度 ${conditions.humidity ?? '--'}%，风速 ${conditions.wind ?? '--'} km/h，降水 ${conditions.precipitation ?? 0} mm；雨雪天减少浅色鞋包，冷天保留外套层次。`,
    tags: ['规则筛选', '偏好学习', '本地智能'],
    confidence: 0.72,
    source: 'local-fallback',
  };
}

function computePreferenceWeights(lookHistory, tasteTags) {
  const weights = { colors: {}, styles: {}, scenes: {} };
  for (const tag of tasteTags) {
    weights.styles[tag] = (weights.styles[tag] || 0) + 1;
  }
  for (const record of lookHistory) {
    const scene = record.conditions?.scene;
    if (scene) weights.scenes[scene] = (weights.scenes[scene] || 0) + 2;
    for (const item of record.pieces || []) {
      weights.colors[item.color] = (weights.colors[item.color] || 0) + 1;
      weights.styles[item.style] = (weights.styles[item.style] || 0) + 1;
    }
  }
  return weights;
}

function topEntries(record, count = 3) {
  return Object.entries(record || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([name]) => name);
}

function garmentMeta(item) {
  return `${item.color} / ${item.season} / ${item.style}`;
}

function seasonFits(item, season) {
  return item.season === season || item.season === '四季';
}

function scoreItem(item, conditions, tasteTags, preferenceWeights = {}) {
  let score = 0;
  const season = getSeason(conditions.temp);
  if (seasonFits(item, season)) score += 5;
  if (item.style === conditions.mood || item.style === conditions.scene) score += 3;
  if (tasteTags.includes(item.style) || tasteTags.includes(item.color)) score += 2;
  score += Math.min(preferenceWeights.colors?.[item.color] || 0, 4);
  score += Math.min(preferenceWeights.styles?.[item.style] || 0, 4);
  if (conditions.scene && preferenceWeights.scenes?.[conditions.scene]) score += 2;
  if (['雨天', '雪天'].includes(conditions.weather) && ['白色', '米色'].includes(item.color)) score -= 2;
  if (conditions.wind >= 20 && item.type === '外套') score += 2;
  if (conditions.precipitation > 0 && ['鞋子', '外套'].includes(item.type)) score += 1;
  if (conditions.temp >= 28 && item.type === '外套') score -= 3;
  return score;
}

function bestByType(items, type, conditions, tasteTags, preferenceWeights) {
  const list = items.filter((item) => item.type === type);
  if (!list.length) return null;
  return [...list].sort((a, b) => scoreItem(b, conditions, tasteTags, preferenceWeights) - scoreItem(a, conditions, tasteTags, preferenceWeights))[0];
}

function generateLook(items, conditions, tasteTags, preferenceWeights = {}) {
  const season = getSeason(conditions.temp);
  const types = conditions.temp >= 28 ? ['上衣', '下装', '鞋子', '配饰'] : ['上衣', '下装', '外套', '鞋子', '配饰'];
  const pieces = types.map((type) => bestByType(items, type, conditions, tasteTags, preferenceWeights)).filter(Boolean);
  const missing = types.filter((type) => !pieces.some((item) => item.type === type));
  const title = `${season}${conditions.mood}${conditions.scene}感`;
  const reason = missing.length
    ? `当前衣柜缺少 ${missing.join('、')}，系统先用已有衣物生成最接近的 Look。`
    : `${conditions.city || '当前城市'} ${conditions.weather}、${conditions.temp} 摄氏度和「${conditions.mood}」状态组合在一起，系统优先选择适合 ${season} 的衣物，并让颜色与场景保持协调。`;

  return { title, reason, season, pieces, missing };
}

function createLookRecord(look, conditions) {
  return {
    id: createId(),
    title: look.title,
    savedAt: new Date().toISOString(),
    conditions: { ...conditions, season: look.season },
    tripPlan: look.tripPlan || null,
    pieces: look.pieces.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color,
      season: item.season,
      style: item.style,
      image: item.image,
    })),
  };
}

function buildDemoLookHistory() {
  return demoLookHistory.map((record) => ({
    ...record,
    pieces: record.pieces
      .map((itemId) => defaultWardrobeMap[itemId])
      .filter(Boolean),
  }));
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `garment-${Date.now()}`;
}

function extractDominantColor(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 16) {
        const alpha = pixels[i + 3];
        if (alpha < 80) continue;
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count += 1;
      }
      resolve(count ? [Math.round(r / count), Math.round(g / count), Math.round(b / count)] : [245, 241, 232]);
    };
    image.onerror = () => resolve([245, 241, 232]);
    image.src = dataUrl;
  });
}

function App() {
  const [path, setPath] = useState(getPath);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState(() => (protectedPaths.includes(getPath()) ? getPath() : '/app'));
  const [garments, setGarments] = useState(defaultWardrobe);
  const [tasteTags, setTasteTags] = useState(defaultPreferences);
  const [conditions, setConditions] = useState(defaultConditions);
  const [lookHistory, setLookHistory] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiRuntimeConfig, setAiRuntimeConfig] = useState(defaultAiRuntimeConfig);
  const [transition, setTransition] = useState({
    active: false,
    phase: '',
    target: getPath(),
  });
  const user = session?.user || null;
  const storageScope = getStorageScope(user);
  const isAuthenticated = Boolean(user?.id);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiRequest('/api/auth/session')
      .then((data) => {
        if (cancelled) return;
        setSession({ user: data.user });
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
      })
      .finally(() => {
        if (!cancelled) setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    setStorageReady(false);
    const versionKey = buildScopedStorageKey(storageScope, clientStorageKeys.wardrobeVersion);
    const tagsKey = buildScopedStorageKey(storageScope, clientStorageKeys.tags);
    const lookHistoryKey = buildScopedStorageKey(storageScope, clientStorageKeys.lookHistory);
    const weatherLocationKey = buildScopedStorageKey(storageScope, clientStorageKeys.weatherLocation);
    let nextGarments = readScopedStored(storageScope, clientStorageKeys.wardrobe, defaultWardrobe);
    const version = localStorage.getItem(versionKey);
    if (version !== DEFAULT_WARDROBE_VERSION) {
      const customItems = nextGarments.filter((item) => !String(item.id).startsWith('seed-'));
      nextGarments = [...defaultWardrobe, ...customItems];
      localStorage.setItem(versionKey, DEFAULT_WARDROBE_VERSION);
      saveScopedStored(storageScope, clientStorageKeys.wardrobe, nextGarments);
    }
    const isDemoScope = storageScope === 'demo';
    const nextTasteTags = readScopedStored(
      storageScope,
      clientStorageKeys.tags,
      isDemoScope ? demoPreferences : defaultPreferences,
    );
    const nextLookHistory = readScopedStored(
      storageScope,
      clientStorageKeys.lookHistory,
      isDemoScope ? buildDemoLookHistory() : [],
    );
    const nextWeatherLocation = readScopedStored(
      storageScope,
      clientStorageKeys.weatherLocation,
      isDemoScope ? demoWeatherLocation : null,
    );
    if (isDemoScope) {
      if (!localStorage.getItem(tagsKey)) saveScopedStored(storageScope, clientStorageKeys.tags, nextTasteTags);
      if (!localStorage.getItem(lookHistoryKey)) saveScopedStored(storageScope, clientStorageKeys.lookHistory, nextLookHistory);
      if (!localStorage.getItem(weatherLocationKey)) saveScopedStored(storageScope, clientStorageKeys.weatherLocation, nextWeatherLocation);
    }
    setGarments(nextGarments);
    setTasteTags(nextTasteTags);
    setConditions(readScopedStored(storageScope, clientStorageKeys.conditions, defaultConditions));
    setLookHistory(nextLookHistory);
    setWeatherLocation(nextWeatherLocation);
    setAiRecommendation(readScopedStored(storageScope, clientStorageKeys.aiRecommendation, null));
    setAiRuntimeConfig(sanitizeAiRuntimeConfig(readScopedSessionStored(storageScope, clientSessionKeys.aiRuntime, defaultAiRuntimeConfig)));
    if (!isAuthenticated) setJournalEntries([]);
    setStorageReady(true);
  }, [sessionReady, storageScope, isAuthenticated]);

  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.wardrobe, garments);
  }, [garments, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.tags, tasteTags);
  }, [tasteTags, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.conditions, conditions);
  }, [conditions, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.lookHistory, lookHistory);
  }, [lookHistory, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.weatherLocation, weatherLocation);
  }, [weatherLocation, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.aiRecommendation, aiRecommendation);
  }, [aiRecommendation, storageReady, storageScope]);
  useEffect(() => {
    if (!storageReady) return;
    saveScopedSessionStored(storageScope, clientSessionKeys.aiRuntime, sanitizeAiRuntimeConfig(aiRuntimeConfig));
  }, [aiRuntimeConfig, storageReady, storageScope]);

  const preferenceWeights = useMemo(
    () => computePreferenceWeights(lookHistory, tasteTags),
    [lookHistory, tasteTags],
  );

  useEffect(() => {
    if (!storageReady) return;
    saveScopedStored(storageScope, clientStorageKeys.preferenceWeights, preferenceWeights);
  }, [preferenceWeights, storageReady, storageScope]);

  const requestApi = async (url, options = {}) => {
    const { headers = {}, ...rest } = options;
    const method = String(rest.method || 'GET').toUpperCase();
    const shouldAttachAiHeaders = hasAiRuntimeSecret(aiRuntimeConfig) && (
      url.startsWith('/api/ai/')
      || url.startsWith('/api/journal/summary')
      || url.startsWith('/api/journal/analyze')
      || (url === '/api/journal' && method === 'POST')
    );
    try {
      return await apiRequest(url, {
        ...rest,
        headers: shouldAttachAiHeaders ? { ...headers, ...buildAiRuntimeHeaders(aiRuntimeConfig) } : headers,
      });
    } catch (error) {
      if (error.status === 401) {
        setSession(null);
        setJournalEntries([]);
        setLoginRedirect(protectedPaths.includes(path) ? path : '/app');
        window.history.replaceState({}, '', '/login');
        setPath('/login');
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    requestApi('/api/journal')
      .then((data) => {
        if (!cancelled && Array.isArray(data.entries)) setJournalEntries(data.entries);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  const journalProfile = useMemo(() => computeJournalProfile(journalEntries), [journalEntries]);

  useEffect(() => {
    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(new Date()),
    [],
  );

  const goTo = (to, options = {}) => {
    const shouldBlock = !options.skipAuth && protectedPaths.includes(to) && !isAuthenticated;
    const target = shouldBlock ? '/login' : to;
    if (shouldBlock) setLoginRedirect(to);
    if (target === path || transition.active) return;
    setTransition({ active: true, phase: 'cover', target });
    window.setTimeout(() => {
      if (options.replace) window.history.replaceState({}, '', target);
      else window.history.pushState({}, '', target);
      setPath(target);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setTransition({ active: true, phase: 'reveal', target });
    }, 560);
    window.setTimeout(() => {
      setTransition({ active: false, phase: '', target });
    }, 1320);
  };

  const navigate = (to) => (event) => {
    event.preventDefault();
    goTo(to);
  };

  useEffect(() => {
    if (!sessionReady) return;
    if (isAuthenticated) return;
    if (path === '/') {
      window.history.replaceState({}, '', '/login');
      setPath('/login');
      return;
    }
    if (protectedPaths.includes(path)) {
      setLoginRedirect(path);
      window.history.replaceState({}, '', '/login');
      setPath('/login');
    }
  }, [isAuthenticated, path]);

  const login = async (credentials) => {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setSession({ user: result.user });
    goTo(loginRedirect || '/app', { replace: true, skipAuth: true });
    return result;
  };

  const register = async (payload) => {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setSession({ user: result.user });
    goTo(loginRedirect || '/app', { replace: true, skipAuth: true });
    return result;
  };

  const logout = () => {
    removeScopedSessionStored(storageScope, clientSessionKeys.aiRuntime);
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }).catch(() => {});
    removeStored('yx-session');
    removeStored('yx-user');
    setSession(null);
    setJournalEntries([]);
    setLoginRedirect('/app');
    goTo('/login', { replace: true });
  };

  const clearAiRuntimeConfig = () => {
    removeScopedSessionStored(storageScope, clientSessionKeys.aiRuntime);
    setAiRuntimeConfig(defaultAiRuntimeConfig);
  };

  const saveLook = (look) => {
    const record = createLookRecord(look, conditions);
    setLookHistory((current) => [record, ...current].slice(0, 8));
  };

  const resetDemoData = () => {
    setGarments(defaultWardrobe);
    setTasteTags(storageScope === 'demo' ? demoPreferences : defaultPreferences);
    setConditions(defaultConditions);
    setLookHistory(storageScope === 'demo' ? buildDemoLookHistory() : []);
    setWeatherLocation(storageScope === 'demo' ? demoWeatherLocation : null);
    setAiRecommendation(null);
    localStorage.setItem(buildScopedStorageKey(storageScope, clientStorageKeys.wardrobeVersion), DEFAULT_WARDROBE_VERSION);
  };

  if (!sessionReady || !storageReady) {
    return (
      <div className="v2-app" style={{ '--mx': pointer.x, '--my': pointer.y }}>
        <CursorAura />
        <main className="page-stage">
          <section className="dashboard-page">
            <PageHeader eyebrow="Syncing" title="正在同步你的空间" />
            <p className="page-copy">系统正在校验登录状态，并按当前账号加载本地偏好。</p>
          </section>
        </main>
      </div>
    );
  }

  const activePath = !isAuthenticated && (protectedPaths.includes(path) || path === '/') ? '/login' : path;
  const visibleNavItems = isAuthenticated ? navItems : publicNavItems;

  return (
    <div className="v2-app" style={{ '--mx': pointer.x, '--my': pointer.y }}>
      <CursorAura />
      <nav className="v2-nav" aria-label="主导航">
        <a className="brand-mark" href={isAuthenticated ? '/' : '/login'} onClick={navigate(isAuthenticated ? '/' : '/login')}>
          <span>悦行天气</span>
          <small>YX WEATHER</small>
        </a>
        <div className="nav-links">
          {visibleNavItems.map((item) => (
            <a
              className={activePath === item.path ? 'is-current' : ''}
              href={item.path}
              onClick={navigate(item.path)}
              key={item.path}
            >
              {item.label}
            </a>
          ))}
        </div>
        <a className="nav-action" href={isAuthenticated ? '/app' : '/login'} onClick={navigate(isAuthenticated ? '/app' : '/login')}>
          {isAuthenticated ? <Sparkles size={17} /> : <LogIn size={17} />}
          {isAuthenticated ? '进入工作台' : '登录或注册'}
        </a>
      </nav>

      <TransitionLayer transition={transition} />

      <main className={`page-stage ${transition.phase === 'reveal' ? 'is-entering' : ''}`} key={activePath}>
        {activePath === '/' && <HomePage today={today} conditions={conditions} navigate={navigate} />}
        {activePath === '/login' && (
          <LoginPage
            user={user}
            login={login}
            register={register}
            logout={logout}
            loginRedirect={loginRedirect}
            navigate={navigate}
            tasteTags={tasteTags}
            setTasteTags={setTasteTags}
          />
        )}
        {activePath === '/app' && (
          <RecommendPage
            today={today}
            conditions={conditions}
            setConditions={setConditions}
            garments={garments}
            tasteTags={tasteTags}
            setTasteTags={setTasteTags}
            lookHistory={lookHistory}
            preferenceWeights={preferenceWeights}
            journalProfile={journalProfile}
            saveLook={saveLook}
            aiRecommendation={aiRecommendation}
            setAiRecommendation={setAiRecommendation}
            aiRuntimeConfig={aiRuntimeConfig}
            setAiRuntimeConfig={setAiRuntimeConfig}
            clearAiRuntimeConfig={clearAiRuntimeConfig}
            weatherLocation={weatherLocation}
            setWeatherLocation={setWeatherLocation}
            requestApi={requestApi}
          />
        )}
        {activePath === '/wardrobe' && <WardrobePage garments={garments} setGarments={setGarments} />}
        {activePath === '/journal' && (
          <JournalPage
            user={user}
            conditions={conditions}
            journalEntries={journalEntries}
            setJournalEntries={setJournalEntries}
            aiRuntimeSignature={`${sanitizeAiRuntimeConfig(aiRuntimeConfig).baseUrl}|${sanitizeAiRuntimeConfig(aiRuntimeConfig).model}|${hasAiRuntimeSecret(aiRuntimeConfig) ? 'on' : 'off'}`}
            requestApi={requestApi}
          />
        )}
        {activePath === '/profile' && (
          <ProfilePage
            user={user}
            tasteTags={tasteTags}
            setTasteTags={setTasteTags}
            conditions={conditions}
            lookHistory={lookHistory}
            journalEntries={journalEntries}
            journalProfile={journalProfile}
            preferenceWeights={preferenceWeights}
            resetDemoData={resetDemoData}
            requestApi={requestApi}
          />
        )}
        {activePath === '/about' && <AboutPage />}
      </main>
    </div>
  );
}

function TransitionLayer({ transition }) {
  const label = pageNames[transition.target] || pageNames['/'];
  return (
    <div className={`transition-layer ${transition.active ? 'is-active' : ''} ${transition.phase}`}>
      <div className="silk-panel" />
      <div className="transition-label">
        <span>{label.en}</span>
        <strong>{label.cn}</strong>
      </div>
    </div>
  );
}

function CursorAura() {
  return <div className="cursor-aura" aria-hidden="true" />;
}

function HomePage({ today, conditions, navigate }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const visibleSlides = [
    { slide: slides[(activeSlide - 1 + slides.length) % slides.length], slot: 'prev' },
    { slide: slides[activeSlide], slot: 'current' },
    { slide: slides[(activeSlide + 1) % slides.length], slot: 'next' },
  ];
  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <>
      <section className="luxury-hero">
        <div className="hero-copy">
          <p className="kicker">Weather meets travel memory</p>
          <h1>悦行天气</h1>
          <p className="hero-lead">
            融合真实天气、情绪语义、行程场景、个人衣柜和行程手记记忆的智能行程助手。
            每一次出门，都会变成下一次推荐的依据。
          </p>
          <div className="today-strip">
            <span>
              <CalendarDays size={16} />
              {today}
            </span>
            <span>
              <ThermometerSun size={16} />
              {conditions.temp} 摄氏度 · {getSeason(conditions.temp)}
            </span>
            <span>
              <Heart size={16} />
              {conditions.mood} · {conditions.scene}
            </span>
          </div>
          <div className="hero-actions">
            <a className="ink-button" href="/app" onClick={navigate('/app')}>
              体验今日行程
              <ArrowUpRight size={18} />
            </a>
            <a className="line-button" href="/wardrobe" onClick={navigate('/wardrobe')}>
              查看衣柜
            </a>
            <a className="line-button" href="/journal" onClick={navigate('/journal')}>
              记录手记
            </a>
          </div>
        </div>

        <div className="editorial-stack" aria-label="时尚图片叙事">
          <div className="stack-controls" aria-label="切换时尚图片">
            <button type="button" onClick={() => moveSlide(-1)} aria-label="上一张">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => moveSlide(1)} aria-label="下一张">
              <ChevronRight size={18} />
            </button>
          </div>
          {visibleSlides.map(({ slide, slot }, index) => (
            <article
              className={`photo-panel is-${slot}`}
              style={{ '--image': `url("${slide.image}")` }}
              key={`${slide.title}-${slot}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{slide.title}</strong>
              <small>{slide.mood}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="story-scroll">
        <StoryCard
          number="01"
          title="天气不是参数，是穿搭的空气感。"
          text="温度决定厚薄，天气决定材质，季节决定层次。系统先读懂今天，再开始搭配。"
        />
          <StoryCard
          number="02"
          title="情绪让推荐更像人，而不是机器。"
          text="一句话状态会转成推荐心情，和天气、场景、衣柜一起影响颜色和轮廓。"
        />
        <StoryCard
          number="03"
          title="用户画像会持续学习。"
          text="保存方案和行程手记会沉淀地点、天气、情绪、交通和负担点，让系统逐渐更懂你。"
        />
      </section>
    </>
  );
}

function StoryCard({ number, title, text }) {
  return (
    <article className="story-card">
      <span>{number}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function LoginPage({ user, login, register, logout, loginRedirect, navigate, tasteTags, setTasteTags }) {
  const [answers, setAnswers] = useState(() => tasteTags.filter((tag) => !['春秋', '轻通勤'].includes(tag)));
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', displayName: '' });
  const [status, setStatus] = useState('');
  const tags = Array.from(new Set([...answers, '春秋', '轻通勤']));
  const toggleAnswer = (option) => {
    setAnswers((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  useEffect(() => {
    setTasteTags(tags);
  }, [tags.join('|')]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setStatus(mode === 'login' ? '正在登录账号...' : '正在创建账号...');
    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password });
        setStatus('登录成功，正在进入个人工作台');
      } else {
        await register({
          username: form.username,
          password: form.password,
          displayName: form.displayName,
        });
        setStatus('注册成功，正在进入个人工作台');
      }
    } catch (error) {
      setStatus(error.message || '认证失败，请稍后再试');
    }
  };

  const fillDemo = () => {
    setMode('login');
    setForm((current) => ({ ...current, ...demoCredentials }));
    setStatus('已填入演示体验账号，可直接登录');
  };

  return (
    <section className="login-experience">
      <div className="page-intro">
        <p className="kicker">Personal travel account</p>
        <h1 className="two-line-title">
          <span>登录后，</span>
          <span>行程才会拥有记忆</span>
        </h1>
        <p>
          首次进入先完成登录或注册。今日行程、衣柜、手记和个性画像都会按你的账号独立保存。
        </p>
      </div>
      <div className="login-grid">
        <form className="glass-form auth-form" onSubmit={submitLogin}>
          <UserRound size={30} />
          <h2>{user?.name || (mode === 'login' ? '账号登录' : '创建账号')}</h2>
          <p>
            {user
              ? `已登录：${user.username}。现在可以进入今日行程、我的手记和个性画像。`
              : `${mode === 'login' ? '登录后' : '注册后'}会进入 ${pageNames[loginRedirect]?.cn || '今日行程'}。你也可以直接体验演示账号。`}
          </p>
          {!user && (
            <>
              <div className="quiz-options auth-mode-switch">
                <button
                  className={mode === 'login' ? 'is-active' : ''}
                  type="button"
                  onClick={() => setMode('login')}
                >
                  登录
                </button>
                <button
                  className={mode === 'register' ? 'is-active' : ''}
                  type="button"
                  onClick={() => setMode('register')}
                >
                  注册
                </button>
              </div>
              <div className="auth-fields">
                {mode === 'register' && (
                  <label>
                    昵称
                    <input
                      value={form.displayName}
                      onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                      placeholder="例如：悦行用户"
                    />
                  </label>
                )}
                <label>
                  账号
                  <input
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="3-20 位字母、数字或下划线"
                  />
                </label>
                <label>
                  密码
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={mode === 'login' ? '请输入密码' : '至少 8 位密码'}
                  />
                </label>
              </div>
              <div className="demo-account">
                <span>演示体验账号</span>
                <strong>demo / Yuexing@2026</strong>
              </div>
              <div className="auth-actions">
                <button className="ink-button" type="submit">
                  <LogIn size={18} />
                  {mode === 'login' ? '登录并进入系统' : '注册并进入系统'}
                </button>
                <button className="line-button" type="button" onClick={fillDemo}>
                  使用演示账号
                </button>
              </div>
            </>
          )}
          {user && (
            <div className="auth-actions">
              <a className="ink-button" href="/app" onClick={navigate('/app')}>
                进入今日行程
              </a>
              <button className="line-button" type="button" onClick={logout}>
                退出登录
              </button>
            </div>
          )}
          {status && <div className="login-hint">{status}</div>}
        </form>

        <div className="quiz-card">
          <p className="kicker">First sign-in quiz</p>
          <h2>首次登录问答</h2>
          {quizQuestions.map((item) => (
            <div className="quiz-row" key={item.question}>
              <strong>{item.question}</strong>
              <div className="quiz-options">
                {item.options.map((option) => (
                  <button
                    className={answers.includes(option) ? 'is-active' : ''}
                    type="button"
                    onClick={() => toggleAnswer(option)}
                    key={option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="look-tags generated-tags">
            {tags.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecommendPage({
  today,
  conditions,
  setConditions,
  garments,
  tasteTags,
  setTasteTags,
  lookHistory,
  preferenceWeights,
  journalProfile,
  saveLook,
  aiRecommendation,
  setAiRecommendation,
  aiRuntimeConfig,
  setAiRuntimeConfig,
  clearAiRuntimeConfig,
  weatherLocation,
  setWeatherLocation,
  requestApi,
}) {
  const look = useMemo(
    () => generateLook(garments, conditions, tasteTags, preferenceWeights),
    [garments, conditions, tasteTags, preferenceWeights],
  );
  const [saveState, setSaveState] = useState('');
  const [moodText, setMoodText] = useState('');
  const [aiState, setAiState] = useState('idle');
  const [weatherState, setWeatherState] = useState('');
  const [cityQuery, setCityQuery] = useState(conditions.city || '');
  const [cityResults, setCityResults] = useState([]);
  const [departureTime, setDepartureTime] = useState(conditions.departureTime || '08:20');
  const [duration, setDuration] = useState(conditions.duration || 4);
  const tripPlan = useMemo(
    () => buildTripPlan({ ...conditions, departureTime, duration }, look, journalProfile),
    [conditions, departureTime, duration, look, journalProfile],
  );
  const runtime = sanitizeAiRuntimeConfig(aiRuntimeConfig);
  const aiRuntimeEnabled = hasAiRuntimeSecret(runtime);

  const setCondition = (key, value) => {
    setConditions((current) => ({
      ...current,
      [key]: value,
      manualWeatherAdjusted: ['weather', 'temp'].includes(key) ? true : current.manualWeatherAdjusted,
    }));
  };

  const applyWeather = (payload) => {
    const current = payload.current || {};
    const city = payload.city || conditions.city || '当前位置';
    const locationLabel = payload.locationLabel || city;
    const coordinateLabel = formatCoordinatePair(payload.latitude, payload.longitude);
    let nextConditions;
    setConditions((currentConditions) => {
      nextConditions = {
        ...currentConditions,
        city,
        locationLabel,
        coordinateLabel,
        latitude: payload.latitude,
        longitude: payload.longitude,
        temp: Math.round(current.temperature_2m ?? currentConditions.temp),
        humidity: current.relative_humidity_2m ?? null,
        precipitation: current.precipitation ?? 0,
        wind: current.wind_speed_10m ?? null,
        weatherCode: current.weather_code ?? null,
        weather: weatherCodeToLabel(current.weather_code),
        weatherUpdatedAt: current.time || new Date().toISOString(),
        source: 'Open-Meteo',
        weatherSource: payload.weatherSource || '城市搜索',
        manualWeatherAdjusted: false,
      };
      return nextConditions;
    });
    setWeatherLocation({ city, locationLabel, coordinateLabel, latitude: payload.latitude, longitude: payload.longitude });
    setCityQuery(city);
    return nextConditions;
  };

  const resolvePlaceName = async (latitude, longitude) => {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: 'zh',
      });
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`);
      if (!response.ok) throw new Error('reverse geocode failed');
      const data = await response.json();
      const pieces = [
        data.city || data.locality,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);
      return pieces.length ? pieces.join(' · ') : `当前定位 ${formatCoordinatePair(latitude, longitude)}`;
    } catch {
      return `当前定位 ${formatCoordinatePair(latitude, longitude)}`;
    }
  };

  const fetchWeather = async (latitude, longitude, city = '当前位置', weatherSource = '城市搜索', locationLabel = city) => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error('weather failed');
    const data = await response.json();
    return applyWeather({ ...data, city, locationLabel, weatherSource });
  };

  const getFallbackLocation = () => {
    if (weatherLocation?.city && weatherLocation.city !== '当前位置') return weatherLocation;
    return {
      city: defaultConditions.city,
      latitude: defaultConditions.latitude,
      longitude: defaultConditions.longitude,
    };
  };

  useEffect(() => {
    let cancelled = false;
    const hasFreshPositionWeather =
      conditions.source === 'Open-Meteo' &&
      conditions.weatherSource === '当前真实定位' &&
      isWeatherFresh(conditions.weatherUpdatedAt);
    const location = getFallbackLocation();
    const fetchFallbackWeather = async (prefix = '') => {
      setWeatherState(`${prefix}改用 ${location.city} 的 Open-Meteo 实时天气...`);
      await fetchWeather(
        location.latitude,
        location.longitude,
        location.city,
        weatherLocation?.city && weatherLocation.city !== '当前位置' ? '上次城市' : '默认城市',
      );
      if (!cancelled) setWeatherState(`已接入 ${location.city} 实时天气`);
    };
    if (hasFreshPositionWeather) return () => {};
    if (!navigator.geolocation) {
      fetchFallbackWeather('当前浏览器不支持定位，')
        .catch(() => {
          if (!cancelled) setWeatherState('Open-Meteo 暂时不可用，当前保留手动条件。');
        });
      return () => {
        cancelled = true;
      };
    }
    setWeatherState('正在请求当前真实定位，用真实位置接入天气...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const placeName = await resolvePlaceName(position.coords.latitude, position.coords.longitude);
          await fetchWeather(position.coords.latitude, position.coords.longitude, placeName, '当前真实定位', placeName);
          if (!cancelled) setWeatherState('已使用当前真实定位接入 Open-Meteo 实时天气');
        } catch {
          if (!cancelled) {
            fetchFallbackWeather('当前位置天气获取失败，')
              .catch(() => setWeatherState('Open-Meteo 暂时不可用，当前保留手动条件。'));
          }
        }
      },
      () => {
        fetchFallbackWeather('定位未授权，')
          .catch(() => {
            if (!cancelled) setWeatherState('Open-Meteo 暂时不可用，当前保留手动条件。');
          });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const locateWeather = () => {
    if (!navigator.geolocation) {
      setWeatherState('当前浏览器不支持定位，请使用城市搜索。');
      return;
    }
    setWeatherState('正在请求当前真实定位，用真实位置刷新天气...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const placeName = await resolvePlaceName(position.coords.latitude, position.coords.longitude);
          await fetchWeather(position.coords.latitude, position.coords.longitude, placeName, '当前真实定位', placeName);
          setWeatherState('已使用当前真实定位接入 Open-Meteo 实时天气');
        } catch {
          const fallback = getFallbackLocation();
          setWeatherState(`当前位置天气获取失败，正在改用 ${fallback.city} 实时天气...`);
          fetchWeather(
            fallback.latitude,
            fallback.longitude,
            fallback.city,
            fallback.city === defaultConditions.city ? '默认城市' : '上次城市',
          )
            .then(() => setWeatherState(`已改用 ${fallback.city} 实时天气`))
            .catch(() => setWeatherState('Open-Meteo 暂时不可用，当前保留手动条件。'));
        }
      },
      () => setWeatherState('定位未授权，请使用城市搜索或手动微调天气。'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    );
  };

  const searchCity = async (event) => {
    event.preventDefault();
    if (!cityQuery.trim()) return;
    setWeatherState('正在搜索城市...');
    try {
      const params = new URLSearchParams({
        name: cityQuery.trim(),
        count: '5',
        language: 'zh',
        format: 'json',
      });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
      const data = await response.json();
      setCityResults(data.results || []);
      setWeatherState(data.results?.length ? '请选择城市结果接入天气。' : '未找到城市，请换一个名称。');
    } catch {
      setWeatherState('城市搜索失败，已保留手动条件。');
    }
  };

  const chooseCity = async (city) => {
    setWeatherState(`正在获取 ${city.name} 天气...`);
    try {
      const placeName = `${city.name}${city.admin1 ? ` · ${city.admin1}` : ''}`;
      await fetchWeather(city.latitude, city.longitude, placeName, '城市搜索', placeName);
      setCityResults([]);
      setWeatherState('已接入 Open-Meteo 实时天气');
    } catch {
      setWeatherState('天气获取失败，已保留手动条件。');
    }
  };

  const classifyMood = async () => {
    if (!moodText.trim()) return;
    setAiState('analyzing-mood');
    try {
      const result = await requestApi('/api/ai/mood', {
        method: 'POST',
        body: JSON.stringify({ text: moodText }),
      });
      const fallback = localMoodFromText(moodText);
      const mood = moodOptions.includes(result.mood) ? result.mood : fallback.mood;
      setConditions((current) => ({ ...current, mood }));
      setTasteTags((current) => Array.from(new Set([...current, ...(result.tags || fallback.tags)])));
      setAiRecommendation((current) => ({
        ...(current || {}),
        moodInsight: result.explanation || fallback.explanation,
        moodSource: result.source || fallback.source,
      }));
      setAiState('idle');
    } catch {
      const result = localMoodFromText(moodText);
      setConditions((current) => ({ ...current, mood: result.mood }));
      setTasteTags((current) => Array.from(new Set([...current, ...result.tags])));
      setAiRecommendation((current) => ({
        ...(current || {}),
        moodInsight: result.explanation,
        moodSource: result.source,
      }));
      setAiState('idle');
    }
  };

  const requestAiRecommendation = async () => {
    setAiState('generating');
    const baseKey = buildRecommendationKey(look, conditions);
    try {
      const result = await requestApi('/api/ai/recommend', {
        method: 'POST',
        body: JSON.stringify({
          conditions,
          garments,
          tasteTags,
          lookHistory,
          preferenceWeights,
          journalProfile,
          moodText,
          baseLook: look,
        }),
      });
      setAiRecommendation({ ...result, baseKey });
    } catch {
      setAiRecommendation({ ...localAiRecommendation(look, conditions, preferenceWeights), baseKey });
    } finally {
      setAiState('idle');
    }
  };

  const recommendationKey = buildRecommendationKey(look, conditions);
  useEffect(() => {
    if (!aiRecommendation || aiRecommendation.source !== 'ai-online' || aiRecommendation.baseKey !== recommendationKey) {
      setAiRecommendation({ ...localAiRecommendation(look, conditions, preferenceWeights), baseKey: recommendationKey });
    }
  }, [recommendationKey]);

  const weatherSourceLabel =
    conditions.weatherSource?.includes('定位') ? '当前真实定位' : conditions.weatherSource || '等待实时同步';
  const weatherDataLabel = conditions.source === 'Open-Meteo'
    ? `Open-Meteo 实时天气 · ${weatherSourceLabel}`
    : '手动条件 / 等待实时同步';
  const weatherUpdatedLabel = formatWeatherTime(conditions.weatherUpdatedAt);

  const handleSaveLook = () => {
    if (!look.pieces.length) return;
    saveLook({ ...look, title: tripPlan.title, tripPlan });
    setSaveState('已保存到行程记录');
    window.setTimeout(() => setSaveState(''), 1800);
  };

  return (
    <section className="dashboard-page">
      <PageHeader eyebrow="Daily trip planner" title="今日行程助手" />
      <div className="recommend-layout">
        <div className="condition-orbit">
          <div className="weather-panel">
            <div className="condition-title">
              <MapPin size={18} />
              <strong>{conditions.locationLabel || conditions.city || '真实天气'}</strong>
            </div>
            <WeatherScene weather={conditions.weather} />
            <p>
              地点：{conditions.locationLabel || conditions.city || '未选择'} · 坐标：{conditions.coordinateLabel || formatCoordinatePair(conditions.latitude, conditions.longitude)}
            </p>
            <p>
              {weatherDataLabel} · {conditions.weather} · {conditions.temp} 摄氏度 · 更新 {weatherUpdatedLabel}
            </p>
            <p>
              湿度 {conditions.humidity ?? '--'}% · 风速 {conditions.wind ?? '--'} km/h · 降水 {conditions.precipitation ?? 0} mm
            </p>
            <div className="weather-actions">
              <button className="line-button" type="button" onClick={locateWeather}>
                <LocateFixed size={17} />
                刷新当前真实定位
              </button>
            </div>
            <form className="city-search" onSubmit={searchCity}>
              <input value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} placeholder="搜索城市，例如：杭州" />
              <button type="submit" aria-label="搜索城市">
                <Search size={17} />
              </button>
            </form>
            {cityResults.length > 0 && (
              <div className="city-results">
                {cityResults.map((city) => (
                  <button type="button" onClick={() => chooseCity(city)} key={`${city.id}-${city.latitude}`}>
                    {city.name}{city.admin1 ? ` · ${city.admin1}` : ''}
                  </button>
                ))}
              </div>
            )}
            {weatherState && <small>{weatherState}</small>}
          </div>
          <ConditionGroup title="天气">
            {weatherOptions.map((item) => (
              <button
                className={conditions.weather === item ? 'is-active' : ''}
                type="button"
                onClick={() => setCondition('weather', item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </ConditionGroup>
          <div className="condition-group">
            <div className="condition-title">
              <ThermometerSun size={18} />
              <strong>温度 {conditions.temp} 摄氏度</strong>
            </div>
            <input
              type="range"
              min="8"
              max="36"
              value={conditions.temp}
              onChange={(event) => setCondition('temp', Number(event.target.value))}
            />
          </div>
          <ConditionGroup title="推荐心情">
            {moodOptions.map((item) => (
              <button
                className={conditions.mood === item ? 'is-active' : ''}
                type="button"
                onClick={() => setCondition('mood', item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </ConditionGroup>
          <ConditionGroup title="行程场景">
            {tripSceneOptions.map((item) => (
              <button
                className={(conditions.tripScene || conditions.scene) === item ? 'is-active' : ''}
                type="button"
                onClick={() => {
                  setCondition('tripScene', item);
                  if (sceneOptions.includes(item)) setCondition('scene', item);
                }}
                key={item}
              >
                {item}
              </button>
            ))}
          </ConditionGroup>
          <ConditionGroup title="出行方式">
            {transportOptions.map((item) => (
              <button
                className={(conditions.transport || '步行') === item ? 'is-active' : ''}
                type="button"
                onClick={() => setCondition('transport', item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </ConditionGroup>
          <div className="condition-group">
            <div className="condition-title">
              <CalendarDays size={18} />
              <strong>出发与在外时长</strong>
            </div>
            <div className="trip-input-row">
              <label>
                出发
                <input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} />
              </label>
              <label>
                在外 {duration} 小时
                <input type="range" min="1" max="12" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
              </label>
            </div>
          </div>
          <div className="ai-mood-box">
            <div className="condition-title">
              <Brain size={18} />
              <strong>一句话状态识别</strong>
            </div>
            <textarea
              value={moodText}
              onChange={(event) => setMoodText(event.target.value)}
              placeholder="例如：今天有点累，但想让推荐看起来精神一点。"
            />
            <button className="line-button" type="button" onClick={classifyMood}>
              {aiState === 'analyzing-mood' ? '识别中...' : 'AI 识别推荐心情'}
            </button>
            {aiRecommendation?.moodInsight && <small>{aiRecommendation.moodInsight}</small>}
          </div>
          <div className="ai-runtime-box">
            <div className="condition-title">
              <Sparkles size={18} />
              <strong>我的模型设置</strong>
            </div>
            <p className="ai-runtime-copy">
              这里的 API Key 只保存在当前浏览器会话里，请求时由后端临时转发，不会写入数据库。
            </p>
            <label>
              Base URL
              <input
                value={runtime.baseUrl}
                onChange={(event) => setAiRuntimeConfig((current) => ({ ...current, baseUrl: event.target.value }))}
                placeholder="https://api.deepseek.com/v1"
              />
            </label>
            <label>
              Model
              <input
                value={runtime.model}
                onChange={(event) => setAiRuntimeConfig((current) => ({ ...current, model: event.target.value }))}
                placeholder="deepseek-chat"
              />
            </label>
            <label>
              API Key
              <input
                type="password"
                value={runtime.apiKey}
                onChange={(event) => setAiRuntimeConfig((current) => ({ ...current, apiKey: event.target.value }))}
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>
            <div className="ai-runtime-actions">
              <button className="line-button" type="button" onClick={clearAiRuntimeConfig}>
                清空本次会话密钥
              </button>
              <small>{aiRuntimeEnabled ? `当前将使用 ${runtime.model}` : '未填写密钥时，AI 功能会自动回退到本地智能。'}</small>
            </div>
          </div>
        </div>
        <article className="look-result">
          <div className="ai-status-row">
            <p className="kicker">AI trip plan · {today}</p>
            <span className={`ai-badge ${aiRecommendation?.source === 'ai-online' ? 'is-online' : ''}`}>
              {aiRecommendation?.source === 'ai-online' ? 'AI 在线' : '本地智能 fallback'}
            </span>
          </div>
          <h2>{tripPlan.title}</h2>
          <p>{tripPlan.strategy}</p>
          <div className="decision-score-row" aria-label="推荐评分">
            <article>
              <span>风险提醒指数</span>
              <strong>{tripPlan.riskScore}</strong>
            </article>
            <article>
              <span>舒适匹配度</span>
              <strong>{tripPlan.comfortScore}</strong>
            </article>
          </div>
          <div className="look-tags">
            {[conditions.weather, `${conditions.temp} 摄氏度`, look.season, conditions.mood, conditions.tripScene || conditions.scene, conditions.transport || '步行', ...(aiRecommendation?.tags || [])].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
          <div className="look-actions">
            <button className="line-button" type="button" onClick={requestAiRecommendation}>
              <Brain size={17} />
              {aiState === 'generating' ? 'AI 生成中...' : '生成 AI 建议'}
            </button>
            <button className="ink-button" type="button" onClick={handleSaveLook}>
              <Save size={17} />
              保存今日方案
            </button>
            {saveState && <small>{saveState}</small>}
          </div>
          <div className="piece-board compact">
            {look.pieces.map((item) => (
              <div
                className="piece-card has-image"
                style={{ '--piece-image': `url("${item.image}")` }}
                key={item.id}
              >
                <span>{item.type}</span>
                <strong>{item.name}</strong>
                <small>{garmentMeta(item)}</small>
              </div>
            ))}
          </div>
          <div className="ai-advice-grid">
            <article>
              <strong>出行策略</strong>
              <p>{aiRecommendation?.sceneTips || tripPlan.moodAdvice}</p>
            </article>
            <article>
              <strong>天气提示</strong>
              <p>{aiRecommendation?.weatherTips || '真实天气接入后，这里会根据湿度、风速和降水提醒衣物材质与层次。'}</p>
            </article>
            <article>
              <strong>携带清单</strong>
              <p>{tripPlan.carry.join('、')}</p>
            </article>
            <article>
              <strong>基于你的手记</strong>
              <p>{tripPlan.memoryHint}</p>
            </article>
          </div>
          <div className="explain-chain">
            <p className="kicker">Explainable AI chain</p>
            {tripPlan.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="look-history-strip">
            <p className="kicker">Saved looks</p>
            {lookHistory.length ? (
              lookHistory.slice(0, 3).map((record) => (
                <article key={record.id}>
                  <strong>{record.title}</strong>
                  <span>{record.pieces.map((item) => item.name).join(' / ')}</span>
                </article>
              ))
            ) : (
              <article>
                <strong>还没有保存记录</strong>
                <span>生成满意的 Look 后保存，偏好页会保留历史。</span>
              </article>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function ConditionGroup({ title, children }) {
  return (
    <div className="condition-group">
      <div className="condition-title">
        <SunMedium size={18} />
        <strong>{title}</strong>
      </div>
      <div className="condition-options">{children}</div>
    </div>
  );
}

function WeatherScene({ weather }) {
  const type = weather === '晴天'
    ? 'sunny'
    : weather === '雨天'
      ? 'rainy'
      : weather === '雪天'
        ? 'snowy'
        : weather === '阴天'
          ? 'cloudy'
          : 'partly';
  return (
    <div className={`weather-scene is-${type}`} aria-label={`${weather}天气动画`}>
      <div className="weather-sun" />
      <div className="weather-cloud cloud-a" />
      <div className="weather-cloud cloud-b" />
      <div className="weather-drops">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="weather-snow">
        <i />
        <i />
        <i />
        <i />
      </div>
      <span>{weather}</span>
    </div>
  );
}

function WardrobePage({ garments, setGarments }) {
  const [activeType, setActiveType] = useState('');
  const [draft, setDraft] = useState({
    name: '',
    color: '白色',
    season: '春秋',
    style: '温柔',
    image: '',
  });
  const visibleItems = activeType ? garments.filter((item) => item.type === activeType) : [];

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const removeGarment = (id) => setGarments((current) => current.filter((item) => item.id !== id));
  const submitGarment = (event) => {
    event.preventDefault();
    if (!activeType || !draft.name.trim()) return;
    const image =
      draft.image ||
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86';
    setGarments((current) => [
      ...current,
      {
        id: createId(),
        name: draft.name.trim(),
        type: activeType,
        color: draft.color,
        season: draft.season,
        style: draft.style,
        image,
      },
    ]);
    setDraft((current) => ({ ...current, name: '', image: '' }));
  };

  const readUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileError = validateImageFile(file);
    if (fileError) {
      window.alert(fileError);
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const image = reader.result;
      const rgb = await extractDominantColor(image);
      const color = rgbToColorName(rgb);
      setDraft((current) => ({
        ...current,
        image,
        color,
        style: inferStyleFromUpload(activeType, file.name, color),
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="dashboard-page">
      <PageHeader eyebrow="Wardrobe archive" title="我的衣柜" />
      <div className="category-rail" aria-label="衣柜分类">
        {wardrobeTypes.map((type) => (
          <button
            className={activeType === type ? 'is-active' : ''}
            style={{ '--category-color': wardrobeTypeMeta[type].color }}
            type="button"
            onClick={() => setActiveType(type)}
            key={type}
          >
            <span>{type}</span>
            <small>{wardrobeTypeMeta[type].hint}</small>
          </button>
        ))}
      </div>
      {activeType ? (
        <div className="category-detail">
          <div className="category-detail-head">
            <p className="kicker">Category opened</p>
            <h2>{activeType}</h2>
            <button type="button" className="line-button" onClick={() => setActiveType('')}>
              返回分类
            </button>
          </div>
          <div className="wardrobe-grid">
            {visibleItems.map((item) => (
              <article className="wardrobe-card" key={item.id}>
                <button
                  className="delete-garment"
                  type="button"
                  aria-label={`删除${item.name}`}
                  onClick={() => removeGarment(item.id)}
                >
                  <Trash2 size={16} />
                </button>
                <div
                  className="garment-photo"
                  style={{ '--garment-image': `url("${item.image}")` }}
                  aria-label={`${item.name} 真实图片`}
                />
                <div className="wardrobe-meta">
                  <span>{item.type}</span>
                  <small>{item.id.startsWith('seed-') ? '示例衣物' : '我的上传'}</small>
                </div>
                <h3>{item.name}</h3>
                <p>{garmentMeta(item)}</p>
              </article>
            ))}
            <form className="add-garment-panel" onSubmit={submitGarment}>
              <div className="upload-preview" style={{ '--garment-image': `url("${draft.image}")` }}>
                {draft.image ? <span>已识别：{draft.color} / {draft.style}</span> : <Upload size={26} />}
              </div>
              <label>
                衣物名称
                <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder={`添加${activeType}`} />
              </label>
              <div className="form-row">
                <label>
                  颜色
                  <select value={draft.color} onChange={(event) => updateDraft('color', event.target.value)}>
                    {colorOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  季节
                  <select value={draft.season} onChange={(event) => updateDraft('season', event.target.value)}>
                    {seasonOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                风格
                <input value={draft.style} onChange={(event) => updateDraft('style', event.target.value)} placeholder="温柔 / 通勤 / 约会" />
              </label>
              <label className="upload-button">
                <Upload size={17} />
                选择真实图片
                <input type="file" accept="image/*" onChange={readUpload} />
              </label>
              <button className="ink-button" type="submit">
                <Plus size={18} />
                添加{activeType}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="wardrobe-empty-copy">选择一个分类，进入对应衣物内容。</p>
      )}
    </section>
  );
}

function JournalPage({ user, conditions, journalEntries, setJournalEntries, aiRuntimeSignature, requestApi }) {
  const [activeView, setActiveView] = useState('entries');
  const [status, setStatus] = useState('');
  const [summaryState, setSummaryState] = useState('');
  const [remoteSummaries, setRemoteSummaries] = useState({ month: null, year: null });
  const [draft, setDraft] = useState({
    title: '',
    place: '',
    tripDate: formatLocalDate(),
    mood: conditions.mood || '松弛',
    scene: conditions.tripScene || conditions.scene || '休闲',
    transport: conditions.transport || '步行',
    content: '',
    photo: '',
    photoColor: '',
    visualTags: [],
  });
  const monthKey = getCurrentMonthKey();
  const yearKey = getCurrentYearKey();
  const monthEntries = journalEntries.filter((entry) => entry.trip_date?.startsWith(monthKey));
  const yearEntries = journalEntries.filter((entry) => entry.trip_date?.startsWith(yearKey));
  const monthSummary = remoteSummaries.month || localJournalSummary(monthEntries, 'month', monthKey);
  const yearSummary = remoteSummaries.year || localJournalSummary(yearEntries, 'year', yearKey);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    const loadSummary = async (period, key) => {
      return requestApi(`/api/journal/summary?period=${period}&key=${key}`);
    };
    setSummaryState('正在同步 AI 月度/年度总结...');
    Promise.all([
      loadSummary('month', monthKey),
      loadSummary('year', yearKey),
    ])
      .then(([month, year]) => {
        if (cancelled) return;
        setRemoteSummaries({ month, year });
        setSummaryState(month.source === 'ai-online' || year.source === 'ai-online' ? 'AI 总结已同步' : '本地智能总结已同步');
      })
      .catch(() => {
        if (cancelled) return;
        setRemoteSummaries({ month: null, year: null });
        setSummaryState('后端总结暂不可用，当前使用前端 fallback');
      });
    return () => {
      cancelled = true;
    };
  }, [journalEntries.length, monthKey, yearKey, aiRuntimeSignature]);

  const readPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileError = validateImageFile(file);
    if (fileError) {
      setStatus(fileError);
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const photo = reader.result;
      const rgb = await extractDominantColor(photo);
      const photoColor = rgbToColorName(rgb);
      setDraft((current) => ({
        ...current,
        photo,
        photoColor,
        visualTags: buildPhotoTags(photoColor, current),
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitJournal = async (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.place.trim()) return;
    setStatus('正在生成 AI 手记摘要...');
    const payload = {
      ...draft,
      title: draft.title.trim(),
      place: draft.place.trim(),
      weatherSnapshot: {
        city: conditions.city,
        weather: conditions.weather,
        temp: conditions.temp,
        humidity: conditions.humidity,
        wind: conditions.wind,
        precipitation: conditions.precipitation,
        updatedAt: conditions.weatherUpdatedAt,
        source: conditions.source,
      },
    };
    try {
      const saved = await requestApi('/api/journal', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setJournalEntries((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
      setStatus('手记已保存，用户画像已吸收这次出行记忆');
    } catch (error) {
      setStatus(error.message || '手记保存失败，请稍后再试。');
      return;
    }
    setRemoteSummaries({ month: null, year: null });
    setDraft((current) => ({ ...current, title: '', place: '', content: '', photo: '', photoColor: '', visualTags: [] }));
    window.setTimeout(() => setStatus(''), 2200);
  };

  const renderSummary = (summary, title) => {
    const stats = summary.stats || {};
    const topWeather = stats.topWeather || [];
    const topMood = stats.topMood || [];
    const topScenes = stats.topScenes || [];
    const topTransport = stats.topTransport || [];
    const topKeywords = stats.topKeywords || [];
    const photos = stats.photos || [];
    return (
      <div className={`memory-summary ${title.includes('年度') ? 'is-yearly' : ''}`}>
        <p className="kicker">{title}</p>
        <h2>{title.includes('年度') ? `${yearKey}，你走过的天气` : `${monthKey} 的出行记忆`}</h2>
        <p>{summary.summary || '继续记录地点、天气和情绪变化，系统会形成更完整的出行记忆。'}</p>
        <div className="summary-metrics">
          <span><strong>{stats.count ?? 0}</strong> 次出行</span>
          <span><strong>{topWeather.join(' / ') || '--'}</strong> 常见天气</span>
          <span><strong>{topMood.join(' / ') || '--'}</strong> 常见情绪</span>
          <span><strong>{topScenes.join(' / ') || '--'}</strong> 常见场景</span>
          <span><strong>{topTransport.join(' / ') || '--'}</strong> 常用方式</span>
        </div>
        <div className="memory-tags">
          {topKeywords.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <p>{summary.suggestions || '下个阶段可以继续记录出行反馈，让画像更稳定。'}</p>
        <div className="memory-photo-wall">
          {photos.map((photo, index) => (
            <span style={{ '--memory-photo': `url("${photo}")` }} key={`${photo}-${index}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="dashboard-page journal-page">
      <PageHeader eyebrow="Travel memory" title="我的手记" />
      <div className="journal-hero">
        <div>
          <p className="kicker">Long-term learning</p>
          <h2>记录去过的地方，也让系统记住你怎样出门。</h2>
          <p>照片、文字、天气和情绪会一起进入用户画像，月度和年度总结会把这些出行记忆变成下一次推荐的依据。</p>
        </div>
        <div className="journal-stats">
          <strong>{journalEntries.length}</strong>
          <span>条出行手记</span>
        </div>
      </div>
      <div className="journal-layout">
        <form className="journal-form" onSubmit={submitJournal}>
          <BookOpen size={26} />
          <h2>新增手记</h2>
          <label>
            标题
            <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="例如：湖边散步" />
          </label>
          <label>
            地点
            <input value={draft.place} onChange={(event) => updateDraft('place', event.target.value)} placeholder="例如：校园湖边 / 咖啡店" />
          </label>
          <div className="form-row">
            <label>
              日期
              <input type="date" value={draft.tripDate} onChange={(event) => updateDraft('tripDate', event.target.value)} />
            </label>
            <label>
              情绪
              <select value={draft.mood} onChange={(event) => updateDraft('mood', event.target.value)}>
                {moodOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              场景
              <select value={draft.scene} onChange={(event) => updateDraft('scene', event.target.value)}>
                {tripSceneOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              出行方式
              <select value={draft.transport} onChange={(event) => updateDraft('transport', event.target.value)}>
                {transportOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label>
            文字记录
            <textarea value={draft.content} onChange={(event) => updateDraft('content', event.target.value)} placeholder="写下今天去了哪里、天气怎样、心情怎样、有没有忘带东西。" />
          </label>
          <label className="upload-button">
            <Camera size={17} />
            添加照片
            <input type="file" accept="image/*" onChange={readPhoto} />
          </label>
          {draft.photo && (
            <div className="journal-preview" style={{ '--memory-photo': `url("${draft.photo}")` }}>
              <span>{draft.photoColor || '照片'} · {draft.visualTags.join(' / ') || '等待标签'}</span>
            </div>
          )}
          <button className="ink-button" type="submit">
            <Sparkles size={17} />
            保存并生成 AI 复盘
          </button>
          {status && <small>{status}</small>}
        </form>
        <div className="journal-panel">
          <div className="journal-tabs">
            {[
              ['entries', '手记列表'],
              ['month', '月度总结'],
              ['year', '年度总结'],
            ].map(([key, label]) => (
              <button className={activeView === key ? 'is-active' : ''} type="button" onClick={() => setActiveView(key)} key={key}>{label}</button>
            ))}
          </div>
          {summaryState && <small className="summary-state">{summaryState}</small>}
          {activeView === 'entries' && (
            <div className="memory-list">
              {journalEntries.length ? journalEntries.map((entry) => (
                <article className="memory-card" key={entry.id}>
                  {entry.photo && <div className="memory-photo" style={{ '--memory-photo': `url("${entry.photo}")` }} />}
                  <div>
                    <span>{entry.trip_date} · {entry.place}</span>
                    <h3>{entry.title}</h3>
                    <p>{entry.ai_summary}</p>
                    <small>{entry.weather_snapshot?.weather || '--'} / {entry.weather_snapshot?.temp ?? '--'} 摄氏度 / {entry.mood} / {entry.transport}</small>
                    <div className="memory-tags">
                      {(entry.tags || []).map((tag) => <span key={`${entry.id}-${tag}`}>{tag}</span>)}
                    </div>
                    <p>{entry.emotion_review}</p>
                  </div>
                </article>
              )) : (
                <article className="memory-card is-empty">
                  <div>
                    <span>Travel Memory</span>
                    <h3>还没有手记</h3>
                    <p>新增一条地点、照片和文字，系统会立即生成摘要、标签、情绪复盘和下次建议。</p>
                  </div>
                </article>
              )}
            </div>
          )}
          {activeView === 'month' && renderSummary(monthSummary, '月度总结')}
          {activeView === 'year' && renderSummary(yearSummary, '年度总结')}
        </div>
      </div>
    </section>
  );
}

function ProfilePage({ user, tasteTags, setTasteTags, conditions, lookHistory, journalEntries, journalProfile, preferenceWeights, resetDemoData, requestApi }) {
  const [newTag, setNewTag] = useState('');
  const [profileModel, setProfileModel] = useState(null);
  const [profileStatus, setProfileStatus] = useState('');
  const addTag = (event) => {
    event.preventDefault();
    const tag = newTag.trim();
    if (!tag) return;
    setTasteTags((current) => Array.from(new Set([...current, tag])));
    setNewTag('');
  };
  const removeTag = (tag) => {
    setTasteTags((current) => current.filter((item) => item !== tag));
  };
  const getProfileTop = (remoteKey, localRecord, count = 3) => {
    if (profileModel?.[remoteKey]) return topEntries(profileModel[remoteKey], count);
    return topEntries(localRecord, count);
  };
  const rebuildProfile = async () => {
    setProfileStatus('正在根据手记重建用户画像...');
    try {
      const result = await requestApi('/api/profile/rebuild', {
        method: 'POST',
      });
      setProfileModel(result.profile || null);
      const learnedTags = topEntries(result.profile?.memory_keywords || {}, 4);
      setTasteTags((current) => Array.from(new Set([...current, ...learnedTags])));
      setProfileStatus('画像已重建，手记关键词已回流到推荐标签');
    } catch {
      setProfileModel({
        place_preferences: journalProfile.places,
        weather_preferences: journalProfile.weather,
        emotion_patterns: journalProfile.moods,
        transport_preferences: journalProfile.transports,
        scene_preferences: journalProfile.scenes,
        memory_keywords: journalProfile.keywords,
      });
      setProfileStatus('后端暂不可用，已用本地手记画像重建');
    }
    window.setTimeout(() => setProfileStatus(''), 2400);
  };
  const profileRows = [
    ['常去地点', getProfileTop('place_preferences', journalProfile.places).join(' / ') || '新增手记后生成'],
    ['喜欢天气', getProfileTop('weather_preferences', journalProfile.weather).join(' / ') || '新增手记后生成'],
    ['情绪模式', getProfileTop('emotion_patterns', journalProfile.moods).join(' / ') || '新增手记后生成'],
    ['出行方式', getProfileTop('transport_preferences', journalProfile.transports).join(' / ') || '新增手记后生成'],
    ['行程类型', getProfileTop('scene_preferences', journalProfile.scenes).join(' / ') || '新增手记后生成'],
    ['记忆关键词', getProfileTop('memory_keywords', journalProfile.keywords, 5).join(' / ') || '新增手记后生成'],
  ];

  return (
    <section className="profile-workspace">
      <div className="page-intro">
        <p className="kicker">Personal memory model</p>
        <h1>个性画像决定下一次出行。</h1>
        <p>
          这里汇总颜色、风格、常用地点、出行方式和天气敏感度。登录问答、保存方案、行程手记都会更新这些信号。
        </p>
      </div>
      <div className="profile-grid">
        <div className="preference-board">
          <Palette size={28} />
          <h2>{user?.name || '未登录用户'} 的偏好标签</h2>
          <div className="look-tags editable-tags">
            {tasteTags.map((item) => (
              <button type="button" onClick={() => removeTag(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <form className="tag-form" onSubmit={addTag}>
            <input
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              placeholder="添加新偏好，例如：复古、冷色、正式"
            />
            <button className="line-button" type="submit">添加标签</button>
          </form>
          <p>
            当前推荐心情：{conditions.weather} / {conditions.mood} / {conditions.scene}。
          </p>
          <div className="learning-summary">
            <p className="kicker">Preference learning</p>
            <div>
              <strong>常穿颜色</strong>
              <span>{topEntries(preferenceWeights.colors).join(' / ') || '保存搭配后生成'}</span>
            </div>
            <div>
              <strong>常用风格</strong>
              <span>{topEntries(preferenceWeights.styles).join(' / ') || '保存搭配后生成'}</span>
            </div>
            <div>
              <strong>常用场景</strong>
              <span>{topEntries(preferenceWeights.scenes).join(' / ') || '保存搭配后生成'}</span>
            </div>
            <div>
              <strong>常去地点</strong>
              <span>{topEntries(journalProfile.places).join(' / ') || '新增手记后生成'}</span>
            </div>
            <div>
              <strong>常用出行方式</strong>
              <span>{topEntries(journalProfile.transports).join(' / ') || '新增手记后生成'}</span>
            </div>
            <div>
              <strong>手记关键词</strong>
              <span>{topEntries(journalProfile.keywords).join(' / ') || '新增手记后生成'}</span>
            </div>
          </div>
          <div className="profile-signal-grid">
            {profileRows.map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <div className="profile-actions">
            <button className="ink-button" type="button" onClick={rebuildProfile}>
              <Brain size={17} />
              根据手记重建画像
            </button>
            {profileStatus && <small>{profileStatus}</small>}
          </div>
          <button className="line-button" type="button" onClick={resetDemoData}>
            <RotateCcw size={17} />
            恢复默认偏好
          </button>
        </div>
        <div className="history-board">
          <p className="kicker">Memory archive</p>
          <h2>保存过的方案与手记</h2>
          <div className="profile-memory-strip">
            <article>
              <strong>{journalEntries.length}</strong>
              <span>条手记</span>
            </article>
            <article>
              <strong>{topEntries(journalProfile.weather)[0] || '--'}</strong>
              <span>常见天气</span>
            </article>
            <article>
              <strong>{topEntries(journalProfile.moods)[0] || '--'}</strong>
              <span>常见情绪</span>
            </article>
            <article>
              <strong>{topEntries(journalProfile.keywords)[0] || '--'}</strong>
              <span>学习信号</span>
            </article>
          </div>
          <div className="profile-proof">
            <p className="kicker">Learning proof</p>
            <p>
              保存方案提供颜色与风格偏好，手记提供地点、天气、情绪、交通与负担点。两类数据会共同影响今日行程的提前时间、携带清单、舒适鞋和低负担路线建议。
            </p>
          </div>
          {lookHistory.length ? (
            <div className="history-list">
              {lookHistory.map((record) => (
                <article className="history-card" key={record.id}>
                  <div className="history-images">
                    {record.pieces.slice(0, 4).map((item) => (
                      <span
                        style={{ '--piece-image': `url("${item.image}")` }}
                        aria-label={item.name}
                        key={`${record.id}-${item.id}`}
                      />
                    ))}
                  </div>
                  <strong>{record.title}</strong>
                  <p>{record.conditions.weather} / {record.conditions.temp} 摄氏度 / {record.conditions.tripScene || record.conditions.scene}</p>
                </article>
              ))}
            </div>
          ) : (
            <p>还没有保存行程方案。去“今日行程”保存一次出门方案，这里会形成作品演示记录。</p>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="about-page">
      <PageHeader eyebrow="Competition concept" title="作品说明" />
      <div className="about-columns">
        <StoryCard
          number="A"
          title="创意来源"
          text="来自学生群体每日出行、天气变化、穿搭选择和复盘记录的真实痛点。"
        />
        <StoryCard
          number="B"
          title="技术路线"
          text="React/Vite + Node.js + SQLite，接入 Open-Meteo，并通过兼容 OpenAI 的模型与本地 fallback 完成分析。"
        />
        <StoryCard
          number="C"
          title="展示价值"
          text="从出门前方案、出门中提醒到出门后手记复盘，形成可演示的 AI 行程闭环。"
        />
      </div>
      <section className="ai-explain">
        <p className="kicker">Where is AI</p>
        <h2>国奖级混合 AI 行程系统</h2>
        <p>
          悦行天气不是一次性的穿搭工具，而是融合真实天气、情绪语义、行程场景、个人衣柜和手记记忆的智能行程助手。
          系统先生成出门方案，再通过手记吸收用户反馈，让下一次推荐更懂用户。
        </p>
        <div>
          <article><strong>环境感知</strong><span>Open-Meteo 提供真实天气，温度、湿度、风速和降水会影响风险提醒。</span></article>
          <article><strong>语义理解</strong><span>一句话状态和手记正文会提取情绪、事件关键词和体验负担点。</span></article>
          <article><strong>多模态记忆</strong><span>衣物照片、行程照片和文字记录共同沉淀颜色、场景和偏好信号。</span></article>
          <article><strong>持续学习</strong><span>保存方案和手记会重建画像，反向影响下一次行程、携带物和穿搭推荐。</span></article>
        </div>
      </section>
      <section className="competition-proof">
        <p className="kicker">AI practice track</p>
        <h2>答辩可讲清的完整闭环</h2>
        <div>
          <span>真实数据接入</span>
          <span>多模态输入</span>
          <span>可解释推荐</span>
          <span>SQLite 持久化</span>
          <span>月度 / 年度总结</span>
          <span>本地 fallback 保底</span>
        </div>
      </section>
    </section>
  );
}

function PageHeader({ eyebrow, title }) {
  return (
    <header className="page-header">
      <p className="kicker">{eyebrow}</p>
      <h1>{title}</h1>
    </header>
  );
}

export default App;
