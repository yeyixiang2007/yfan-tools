# yfan-tools — 开发任务清单

> 设计稿参考: ARCHITECTURE.md
> 目标: yfan.space 小工具集合服务平台 MVP

---

## Phase 0: 项目脚手架 ✅

### 0.1 初始化项目
- [x] `npm init`，package.json 配置
- [x] 安装核心依赖: fastify, @fastify/view, ejs, @fastify/static, @fastify/formbody, better-sqlite3
- [x] 安装开发依赖: nodemon
- [x] 创建目录结构

### 0.2 服务入口
- [x] `app.js` — Fastify 实例化 + 插件注册
- [x] 静态资源路由 (`/static/`)
- [x] 视图引擎 (EJS) 配置
- [x] 错误处理中间件
- [x] PM2 进程配置文件 (`ecosystem.config.js`)

### 0.3 页面模板
- [x] layout.ejs — 公共布局（导航栏 + 页脚 + Tailwind CDN）
- [x] index.ejs — 首页（工具卡片网格）
- [ ] 404.ejs — 自定义 404

---

## Phase 1: 核心工具

### 1.1 Markdown → PDF (`/md2pdf`)
- [x] 路由: GET `/md2pdf`
- [x] 前端: 文本编辑器 + 实时预览
- [x] 参数选项（页边距、字体大小）
- [ ] 文件上传（导入 .md 文件）
- [x] 结果: PDF 下载 (html2pdf.js) + HTML 预览
- [ ] 后端: 调用本地 md2pdf 脚本生成更高质量 PDF

### 1.2 JSON 格式化 (`/json`)
- [x] 路由: GET `/json`
- [x] 纯前端: JSON 输入框 → 格式化/压缩/校验
- [x] 一键复制结果
- [ ] 输入框语法高亮（已加 line numbering？）
- [ ] 错误行标红提示 + JSON 文件导入

### 1.3 二维码生成 (`/qrcode`)
- [x] 路由: GET `/qrcode`
- [x] 输入文本 → qrcodejs 实时渲染
- [x] 可配置: 尺寸、颜色(前景/背景)、纠错级别
- [x] PNG 下载

### 1.4 Base64 编解码 (`/base64`)
- [x] 路由: GET `/base64`
- [x] 文本 Base64 编解码
- [x] UTF-8 中文兼容
- [x] 一键复制
- [ ] 文件上传编解码（图片/文件 → Base64）

### 1.5 UUID 生成器 (`/uuid`)
- [x] 路由: GET `/uuid`
- [x] crypto.randomUUID() 生成
- [x] 支持 v4 / v7
- [x] 批量生成 (1-100)
- [x] 一键复制

### 1.6 时间戳转换 (`/timestamp`)
- [x] 路由: GET `/timestamp`
- [x] Unix 秒级 ↔ 日期时间
- [x] 毫秒级支持
- [x] UTC+8 / UTC+0 时区切换
- [x] 实时显示当前时间

### 1.7 颜色工具 (`/color`)
- [x] 路由: GET `/color`
- [x] HEX/RGB/HSL 互转
- [x] 取色器
- [x] 预置色板

---

## Phase 2: 部署上线 ✅

### 2.1 Nginx 配置
- [x] 反向代理到 127.0.0.1:3000
- [x] SSL 证书 (Let's Encrypt)
- [x] 静态资源缓存 7天
- [x] 请求体大小限制 (20MB)
- [x] HTTP → HTTPS 跳转

### 2.2 域名
- [x] DNS: yfan.space → 服务器 IP
- [x] HTTPS 访问正常

### 2.3 监控
- [x] PM2 日志管理
- [x] 进程守护 + 开机自启

---

## Phase 3: 增强完善（下一步）

### 3.1 JSON 增强
- [ ] 语法高亮（CodeMirror 或 highlight）
- [ ] 错误行定位标红
- [ ] JSON 文件拖拽上传

### 3.2 404 页面
- [ ] 自定义 404.ejs

### 3.3 Base64 文件上传编解码
- [ ] 图片/文件 → Base64
- [ ] Base64 → 文件下载

### 3.4 md2pdf 后端增强
- [ ] 调用本地 md2pdf Node.js 脚本
- [ ] 更高 PDF 排版质量

---

## 交付物检查清单

- [x] `curl https://yfan.space` 返回首页
- [x] 每个工具页面可访问
- [x] md2pdf 转换功能正常（纯前端）
- [x] Nginx 反向代理正常
- [x] HTTPS 证书有效
- [x] 服务重启后自动恢复 (PM2)
