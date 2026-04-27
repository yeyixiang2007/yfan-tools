# yfan-tools — 架构设计

> 基于 yfan.space 的小工具集合服务平台
> 2026-04-26 | v0.1 (设计稿)

---

## 一、技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| 运行时 | Node.js v22.22.2 | 服务器已有，开发效率高，npm 生态丰富 |
| Web 框架 | **Fastify** | 性能高于 Express，自带 schema 验证和 Swagger |
| 前端渲染 | **EJS / Nunjucks** (SSR) | 小工具不需要 SPA，服务端渲染更轻量 |
| 或 | **Hono** | 更现代，支持 JSX，轻量 |
| 数据库 | **SQLite** (better-sqlite3) | 零配置，小工具数据量足够，文件级存储 |
| CSS | **Tailwind CSS** (CDN) | 快速出界面，MVP 阶段不用构建工具 |
| 部署 | **PM2** + **Nginx 反向代理** | 进程管理+域名路由 |
| 进程管理 | **PM2** | 自动重启、日志管理 |

### 备选方案

- 如果未来需要 API 给第三方用，可加一层 **Hono** 作为 API Gateway
- 如果工具增多到 20+，考虑换 **SQLite → SQLite 多库**（按工具分库）

---

## 二、项目目录结构

```
/root/workspace/yfan-tools/
├── package.json
├── app.js                    # Fastify 入口
├── src/
│   ├── server.js             # 服务启动配置
│   ├── routes/               # 路由
│   │   ├── index.js          # 首页
│   │   ├── md2pdf.js         # Markdown转PDF
│   │   ├── qrcode.js         # 二维码生成
│   │   ├── json-format.js    # JSON格式化
│   │   ├── base64.js         # Base64编解码
│   │   ├── uuid-gen.js       # UUID生成器
│   │   ├── color-picker.js   # 颜色选择/转换
│   │   └── timestamp.js      # 时间戳转换
│   ├── views/                # 模板
│   │   ├── layout.ejs        # 公共布局
│   │   ├── index.ejs         # 首页（工具列表）
│   │   ├── md2pdf.ejs
│   │   ├── qrcode.ejs
│   │   └── ...
│   ├── public/               # 静态资源
│   │   ├── css/
│   │   │   └── app.css
│   │   └── js/
│   │       └── app.js
│   └── utils/                # 工具函数
│       ├── md2pdf.js         # 调用本地 Python md2pdf
│       └── response.js       # 统一响应格式
├── data/                     # SQLite 数据库
│   └── tools.db
├── uploads/                  # 上传文件临时存储
├── ecosystem.config.js       # PM2 配置
└── ARCHITECTURE.md           # 本文件
```

---

## 三、部署架构

```
Internet
    │
    ▼  ┌─────────────────────────────────────┐
    │  │  DNS: yfan.space → 服务器 IP        │
    │  └─────────────────────────────────────┘
    │
    ▼  ┌─────────────────────────────────────┐
    │  │  Nginx (端口 80/443)                │
    │  │  - SSL termination (Let's Encrypt)   │
    │  │  - 静态文件直接 Serve                │
    │  │  - 反向代理到 :3000                  │
    │  │  - 速率限制 + 日志                   │
    │  └─────────────────────────────────────┘
    │
    ▼  ┌─────────────────────────────────────┐
    │  │  PM2 → Node.js Fastify (:3000)       │
    │  │  - 路由分发                          │
    │  │  - Session 管理                      │
    │  │  - 调用本地工具链                     │
    │  └─────────────────────────────────────┘
    │
    ▼  ┌──────────────┬──────────────┐
    │  │  Python 脚本  │   SQLite     │
    │  │  (md2pdf等)   │   (数据存储)  │
    │  └──────────────┴──────────────┘
```

### Nginx 配置要点

```nginx
server {
    listen 80;
    server_name yfan.space www.yfan.space;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 文件上传限制
        client_max_body_size 20m;
    }

    # 静态资源直接由 Nginx 处理
    location /static/ {
        alias /root/workspace/yfan-tools/src/public/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 四、MVP 工具清单

按开发顺序排列：

### P0 — 基础设施
| # | 工具 | 路由 | 说明 |
|---|------|------|------|
| 0 | **首页导航** | `/` | 工具列表 + 搜索，EJS 渲染 |

### P1 — 核心工具

| # | 工具 | 路由 | 实现 | 预计工时 |
|---|------|------|------|----------|
| 1 | **Markdown → PDF** | `/md2pdf` | 前端上传 md → 后端调 Python 转换 → 返回 PDF 下载 | 2h |
| 2 | **二维码生成** | `/qrcode` | 输入文本/URL → 前端用 qrcode.js 生成 → 可下载 PNG | 1h |
| 3 | **JSON 格式化** | `/json-format` | 粘贴 JSON → 格式化/压缩/校验 → 复制结果 | 1h |
| 4 | **Base64 编解码** | `/base64` | 输入文本/文件 → 编码/解码 → 复制/下载 | 0.5h |
| 5 | **UUID 生成器** | `/uuid-gen` | 批量生成 UUID v4/v7，支持数量选择 → 复制 | 0.5h |

### P2 — 扩展工具

| # | 工具 | 路由 | 实现 | 预计工时 |
|---|------|------|------|----------|
| 6 | **时间戳转换** | `/timestamp` | Unix 时间戳 ↔ 日期时间互转，支持时区选择 | 0.5h |
| 7 | **颜色工具** | `/color` | HEX/RGB/HSL 互转，取色器，色板预览 | 1h |

---

## 五、每个工具实现概要

### 1. Markdown → PDF (`/md2pdf`)

```
用户上传 .md 文件或粘贴内容
    │
    ▼
后端接收 → 保存临时文件 → 调用 md2pdf Python 脚本
    │
    ▼
Python: markdown() → WeasyPrint HTML() → write_pdf()
    │
    ▼
返回 PDF 给用户下载 → 清理临时文件
```

- 前端：文本编辑器 + 文件上传 + 格式选项（边距、字号）
- 后端：`child_process.execFile` 调用 Python 脚本
- 已有关联：`/root/workspace/md2pdf/`

### 2. 二维码生成 (`/qrcode`)

- 纯前端实现：`qrcode.js` CDN 库
- 输入文本 → 实时渲染二维码 → SVG/PNG 下载
- 可配置：尺寸、颜色、纠错级别

### 3. JSON 格式化 (`/json-format`)

- 纯前端：`JSON.parse()` + `JSON.stringify(obj, null, 2)`
- 支持：格式化、压缩、校验、复制结果
- 自动语法高亮（`<pre>` + CSS）

### 4. Base64 编解码 (`/base64`)

- 前端：`btoa()` / `atob()` 文本编解码
- 后端（可选）：文件上传 → Base64 编码 → 下载
- 支持 UTF-8 中文字符（`encodeURIComponent` 兼容）

### 5. UUID 生成器 (`/uuid-gen`)

- 纯前端：`crypto.randomUUID()` (Node 19+, 浏览器均支持)
- 批量生成：1-100 个
- 支持版本：v4 (random), v7 (time-ordered)
- 一键复制

### 6. 时间戳转换 (`/timestamp`)

- 纯前端：`Date.now()` / `new Date(timestamp).toLocaleString()`
- 支持：秒级/毫秒级时间戳
- 支持：UTC+8 / UTC+0 时区切换
- 实时：显示"当前时间"和对应时间戳

### 7. 颜色工具 (`/color`)

- 纯前端：颜色空间数学转换
- HEX ↔ RGB ↔ HSL 互转
- 取色器：`<input type="color">`
- 色板：预置配色方案

---

## 六、数据统计（可选）

MVP 阶段可暂不加，后续如需要：

```sql
-- 工具访问统计表
CREATE TABLE tool_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_name TEXT NOT NULL,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip TEXT,
  user_agent TEXT
);
```

用 SQLite 记录每个工具的访问次数，在首页展示"热门工具"。

---

## 七、MVP 开发顺序

```
Week 1:
  Day 1: Fastify 项目初始化 + 首页导航 + 部署配置 (Nginx + PM2)
  Day 2: Markdown → PDF 工具 + JSON 格式化
  Day 3: 二维码生成 + Base64 编解码
  Day 4: UUID 生成器 + 时间戳转换
  Day 5: 颜色工具 + 收尾测试 + 部署上线
```

实际按我的速度，集中时间**1-2 天**可完成 MVP。

---

## 八、外部访问配置步骤

```bash
# 1. DNS 解析（在域名管理面板操作）
#    yfan.space  A 记录 → 服务器 IP
#    www.yfan.space  CNAME → yfan.space

# 2. 安装 Nginx（如未安装）
apt-get install nginx certbot python3-certbot-nginx

# 3. 配置 SSL
certbot --nginx -d yfan.space -d www.yfan.space

# 4. 启动服务
cd /root/workspace/yfan-tools
npm install
pm2 start ecosystem.config.js

# 5. 验证
curl http://localhost:3000  # 本地
curl https://yfan.space     # 外部
```

---

*架构设计稿 v0.1 — 待确认后进入开发*
