# 悦行天气

悦行天气是一款融合真实天气、情绪语义理解、行程场景建模、个人衣柜偏好和行程手记记忆的智能行程助手。

当前版本已经从“比赛演示原型”推进到“可注册、可登录、可部署”的真实系统形态：

- 首次访问默认进入登录页 `/login`
- 支持注册、登录、退出登录和会话校验
- 用户手记、月度总结、年度总结按登录用户隔离
- 接入 DeepSeek/OpenAI-compatible 大模型，未配置时自动回退本地智能 fallback
- Node 服务可直接托管 `dist`，便于 Render 这类平台单服务部署

## 页面结构

- 首页 `/`
  登录后可访问首页叙事视图；未登录访问会优先进入登录页
- 登录 `/login`
  支持注册和登录，也保留演示体验账号 `demo / Yuexing@2026`
- 今日行程 `/app`
- 我的衣柜 `/wardrobe`
- 我的手记 `/journal`
- 个性画像 `/profile`
- 作品说明 `/about`

## 核心功能

### 今日行程助手

- 自动请求当前位置天气，未授权时回退到默认或上次城市
- 接入 Open-Meteo 真实天气，展示地点、坐标、湿度、风速和降水
- 支持一句话状态识别，映射推荐心情和偏好标签
- 根据天气、情绪、场景、出行方式、在外时长和衣柜生成行程方案
- 展示风险提醒指数、舒适匹配度、携带清单和可解释推荐链
- DeepSeek 可用时返回 `ai-online`，不可用时自动切换 `local-fallback`

### 我的衣柜

- 分类管理上衣、下装、外套、鞋子、配饰
- 支持上传真实衣物图片
- 使用 Canvas 提取图片主色，并建议颜色和风格标签

### 我的手记

- 支持新增标题、地点、日期、天气快照、情绪、场景、出行方式、照片和正文
- 保存后调用 `/api/journal` 生成 AI 摘要、标签、情绪复盘和下次建议
- 月度总结和年度总结通过 `/api/journal/summary` 读取或生成
- 手记数据按当前登录用户隔离

### 个性画像

- 汇总偏好标签、常穿颜色、常用风格、常用场景
- 汇总手记学习出的常去地点、喜欢天气、情绪模式、出行方式、行程类型和记忆关键词
- 支持调用 `/api/profile/rebuild` 根据当前登录用户的手记重建画像

## 后端 API

### 认证

- `POST /api/auth/register`
  注册新用户，写入 HttpOnly Cookie，并返回 `user`
- `POST /api/auth/login`
  登录，写入 HttpOnly Cookie，并返回 `user`
- `GET /api/auth/session`
  校验当前登录状态
- `POST /api/auth/logout`
  退出登录

### AI 与业务

- `POST /api/ai/recommend`
  生成个性化行程与穿搭建议
- `POST /api/ai/mood`
  识别一句话状态对应的推荐心情
- `POST /api/journal`
  新增手记并生成 AI 分析
- `GET /api/journal`
  读取当前登录用户的手记列表
- `POST /api/journal/analyze`
  单独分析手记文本与照片标签
- `GET /api/journal/summary?period=month&key=2026-04`
  读取或生成当前登录用户的月度总结
- `GET /api/journal/summary?period=year&key=2026`
  读取或生成当前登录用户的年度总结
- `POST /api/profile/rebuild`
  根据当前登录用户的手记重建用户画像

除注册、登录外，其余 `/api/*` 接口默认通过 HttpOnly Cookie 会话鉴权。

## 技术路线

- React
- Vite
- Node.js
- better-sqlite3
- Open-Meteo 真实天气
- DeepSeek / OpenAI-compatible 大模型接口
- localStorage 按用户命名空间缓存衣柜、偏好、天气位置和行程方案
- SQLite 持久化用户、会话、手记和月度/年度总结

## 本地运行

```bash
npm install
npm run dev:full
```

如果只想前后端分开运行：

```bash
npm run api
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
AI_BASE_URL=https://api.deepseek.com/v1
AI_API_KEY=your_deepseek_or_openai_compatible_key_here
AI_MODEL=deepseek-chat
PORT=8787
```

- 配置 `AI_API_KEY` 后，系统会优先请求 DeepSeek
- 未配置或接口失败时，自动回退为本地智能 fallback

## 部署

推荐使用 Render 单服务部署：

1. 构建命令：`npm install && npm run build`
2. 启动命令：`npm start`
3. 环境变量：`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`
4. 服务启动后即可获得 `onrender.com` 网址
5. 项目根目录已提供 `render.yaml`，可直接作为 Render Blueprint 使用

更完整的上线步骤见 [docs/部署上线说明.md](D:/desktop/codex/yuexing-weather-fashion-web/docs/部署上线说明.md)。

## 当前已知边界

- 衣柜和部分偏好仍保存在浏览器本地，尚未迁移到后端
- 图片仍以 base64 方式保存，适合当前原型阶段，不适合大规模生产
- 还未接入邮件验证、短信验证和密码找回


## 2026-04-24 安全与数据修复补充

- 认证方式已改为 HttpOnly Cookie 会话，前端不再保存 token，也不再使用 `Authorization: Bearer`。
- 本地衣柜、偏好、天气位置、推荐缓存已按用户 ID 做命名空间隔离，切换账号不会再串数据。
- `POST /api/auth/login` 和 `POST /api/auth/register` 已增加基础限流；连续登录失败过多会被短暂阻断。
- 服务端请求体默认限制为 2.5MB；手记图片限制为 1.5MB，并落盘到 `/uploads/*`，不再直接以 base64 写入 SQLite。
- 手记保存失败时，前端不再做本地兜底落库，避免出现前后端数据分叉。
- 如需跨域调用，请在 `.env` 中配置 `CORS_ORIGINS`，多个 origin 用逗号分隔。
