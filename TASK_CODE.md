# yfan-tools — Phase 0.1: 项目脚手架

你是一个全栈开发者。请在 /root/workspace/yfan-tools/ 下完成项目初始化。

## 项目背景
基于 yfan.space 域名的小工具集合服务，Node.js Fastify + EJS + Tailwind CSS。
架构设计见 ARCHITECTURE.md，任务清单见 TASK_LIST.md。

## 任务

### 1. npm 初始化并安装依赖
```bash
cd /root/workspace/yfan-tools
npm init -y
npm install fastify @fastify/view @fastify/static @fastify/formbody @fastify/cors ejs
npm install --save-dev nodemon
```

### 2. 创建目录结构
```
/root/workspace/yfan-tools/
├── app.js                # 服务入口
├── routes/
│   └── index.js          # 路由
├── views/
│   ├── layout.ejs        # 公共布局（Tailwind CDN）
│   ├── index.ejs         # 首页
│   └── (每个工具一个占位页面)
├── public/
│   └── css/
│       └── app.css       # 自定义样式
├── utils/
├── data/
└── ecosystem.config.js   # PM2 配置
```

### 3. 入口文件 app.js
- Fastify 实例化
- 注册插件：static, view (EJS), formbody, cors
- 监听 0.0.0.0:3000
- 导出 app (module.exports)

### 4. 路由 routes/index.js
- GET `/` — 首页，渲染工具卡片列表
- GET `/:tool` — 每个工具页面（先放简单占位）

工具列表（7个）：
1. /md2pdf — Markdown→PDF
2. /json — JSON格式化
3. /qrcode — 二维码生成
4. /base64 — Base64编解码
5. /uuid — UUID生成器
6. /timestamp — 时间戳转换
7. /color — 颜色工具

### 5. 模板
- layout.ejs: 公共布局
  - Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
  - 导航栏 + 内容区 + 页脚
  - 响应式设计
- index.ejs: 工具卡片网格 (2-3列，响应式)
- 每个工具一个简单的 .ejs 文件（标题+占位内容）

### 6. ecosystem.config.js — PM2 配置

### 7. 验证
```bash
node app.js
# 访问 http://localhost:3000/ 确认首页正常
```

### 8. Git 提交
```bash
cd /root/workspace/yfan-tools
git add -A
git commit -m "feat: init project scaffold with Fastify + EJS"
```

## 约束
- 所有文件在 /root/workspace/yfan-tools/ 下
- EJS 模板使用 Tailwind CSS CDN (不要额外安装)
- 不要创建 GitHub 远程仓库（token 权限不足）
- 完成后验证服务能正常启动
- 没有 nginx 先不管，监听 3000 端口即可
