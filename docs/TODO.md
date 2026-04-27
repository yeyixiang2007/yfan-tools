# yfan-tools — Phase 0.1

## 初始化项目

1. cd /root/workspace/yfan-tools
2. npm init -y
3. npm install fastify @fastify/view @fastify/static @fastify/formbody @fastify/cors ejs better-sqlite3
4. npm install --save-dev nodemon
5. 创建目录结构: routes/, views/, public/css/, public/js/, utils/, data/

## 入口文件 app.js

```javascript
const Fastify = require('fastify')
const path = require('path')

const app = Fastify({ logger: true })

// Static files
app.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/static/',
})

// View engine
app.register(require('@fastify/view'), {
  engine: { ejs: require('ejs') },
  root: path.join(__dirname, 'views'),
})

// Form body
app.register(require('@fastify/formbody'))

// CORS
app.register(require('@fastify/cors'), {
  origin: ['https://yfan.space', 'http://yfan.space', 'http://localhost:3000']
})

// Routes
app.register(require('./routes/index'), { prefix: '/' })

// Start
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server running on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()

module.exports = app
```

## 路由 routes/index.js

```javascript
module.exports = async function (fastify, opts) {
  fastify.get('/', async (req, reply) => {
    const tools = [
      { name: 'Markdown → PDF', path: '/md2pdf', desc: '将 Markdown 文档转换为 PDF', icon: '📄' },
      { name: 'JSON 格式化', path: '/json', desc: 'JSON 格式化、压缩、校验', icon: '🔧' },
      { name: '二维码生成', path: '/qrcode', desc: '生成二维码图片', icon: '📱' },
      { name: 'Base64 编解码', path: '/base64', desc: 'Base64 编码与解码', icon: '🔐' },
      { name: 'UUID 生成器', path: '/uuid', desc: '批量生成 UUID v4/v7', icon: '🆔' },
      { name: '时间戳转换', path: '/timestamp', desc: 'Unix 时间戳 ↔ 日期时间', icon: '⏰' },
      { name: '颜色工具', path: '/color', desc: 'HEX/RGB/HSL 互转', icon: '🎨' },
    ]
    return reply.view('index', { tools, title: 'yfan.tools' })
  })
  
  // Placeholder routes for each tool
  const toolRoutes = ['md2pdf', 'json', 'qrcode', 'base64', 'uuid', 'timestamp', 'color']
  for (const route of toolRoutes) {
    fastify.get(`/${route}`, async (req, reply) => {
      return reply.view(route, { title: route, tools })
    })
  }
}
```

## 模板

- views/layout.ejs — 公共布局
- views/index.ejs — 首页（工具卡片网格）
- 每个工具一个 .ejs 文件（先放占位内容）

## ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'yfan-tools',
    script: 'app.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: { NODE_ENV: 'production' }
  }]
}
```

完成后提交所有代码，推送到 GitHub，创建 PR 到 main 分支。
项目仓库地址还没创建，可以先在本地 git commit，后续推送。
如果还没有远程仓库，先不要 push，commit 即可。
