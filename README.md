# ZüriLese · 德语阅读学习 Web 应用

一个类似 Readle 的完整版德语学习应用：按 CEFR 分级阅读苏黎世生活故事，
支持点词即译、逐句朗读、课后测验、生词卡（间隔重复）与学习进度统计。

## 快速开始

```bash
npm run setup    # 安装根目录、server、client 的依赖
npm run dev      # 同时启动后端 (:4000) 与前端 (:5173)
```

打开 http://localhost:5173 即可开始学习 —— 无需注册登录，
学习进度自动保存在当前设备（浏览器）上。不同设备各自独立。

## 技术栈

- 前端：React + Vite（中文界面，德语内容）
- 界面语言：英文（词汇释义、测验讲解、语法参考均为英文）
- 后端：Node.js + Express + SQLite（better-sqlite3）
- 身份：本地设备模式（无需注册登录，按设备自动建号，JWT 接口保留备用）
- 朗读：默认 Microsoft Edge 神经网络德语语音（免费、接近真人）；
  可手动切换为系统语音，配置 `OPENAI_API_KEY` 后可选用 OpenAI 高质量语音

## 朗读引擎（可选升级）

阅读器工具栏可以随时切换朗读引擎：

- **自动（默认）**：优先使用 Microsoft Edge 免费神经网络德语语音
  （de-DE-KatjaNeural，接近真人发音），失败时自动降级为系统语音
- **免费高质量（Edge）**：强制使用 Edge 语音，无需任何 key
- **OpenAI 高质量**：可选。在 `server/.env` 里加 `OPENAI_API_KEY=sk-...`
  后可用（gpt-4o-mini-tts，德语女声 nova）
- **系统语音**：浏览器自带语音，免费、离线可用，音质取决于操作系统

## 局域网分享（同一 Wi-Fi）

让同一 Wi-Fi 下的手机/电脑访问：

```bash
npm run share   # 构建后启动局域网服务（端口 4100）
```

然后打开 `http://<你电脑的局域网IP>:4100`。查 IP：

```bash
ipconfig getifaddr en0   # macOS
```

注意：
- 所有设备必须在同一个 Wi-Fi，且路由器没开启“客户端隔离”
- macOS 防火墙第一次启动时选择“允许传入连接”
- 离开这个 Wi-Fi 就打不开；想要哪里都能访问，需要部署到公网

## 目录结构

```
zurich-deutsch/
├── client/          # React 前端
│   └── src/
│       ├── pages/   # 课程库、阅读器、测验、生词卡、语法、登录
│       └── ...
├── server/          # Express API
│   ├── src/
│   │   ├── index.js # 应用与路由
│   │   ├── db.js    # SQLite 初始化
│   │   └── content.js # 课程内容（3 篇 A2 苏黎世故事）
│   └── data/        # 数据库文件（运行时生成）
└── package.json
```

## API 概览

- `POST /api/auth/register|login` · `GET /api/me`
- `GET /api/lessons?level=` · `GET /api/lessons/:id`
- `POST /api/lessons/:id/complete` · `POST /api/lessons/:id/quiz-result`
- `GET|POST /api/vocab` · `DELETE /api/vocab/:id` · `POST /api/vocab/:id/review`
- `GET /api/stats`

## 后续规划

- 更多级别与主题的故事（B1–C1）
- 每日一篇推送与通知
- 多语言界面（英/德）
- PWA 打包与移动端适配

## 故事宇宙（K-str）

原创故事都发生在 **K-Str** 的 WOKO 合租楼（一共 42 位室友）：

- K-str 住户：Rodrigo、Jemma、Sujani、Hugo、Damian、Rasmus、Jonas、Jamie、Cindy、Sara、Mohamed、Fred、Felix、Emilie
- 曾住 K-str 后离开：Steven（美国朋友，已回国）
- 常客：Mia（一只花色小母猫，经常来花园，喜欢串门睡觉）
- 邻居（住在 H-Str，不是 K-str 住户）：Finn、Leonard

除非特别说明，新故事默认都属于这个宇宙。
