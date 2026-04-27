const Fastify = require('fastify')
const path = require('path')

const app = Fastify({ logger: true })

// ── Static files ──
app.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/static/',
})

// ── View engine (EJS) ──
app.register(require('@fastify/view'), {
  engine: { ejs: require('ejs') },
  root: path.join(__dirname, 'views'),
})

// ── Form body parser ──
app.register(require('@fastify/formbody'))

// ── CORS ──
app.register(require('@fastify/cors'), {
  origin: [
    'https://yfan.space',
    'http://yfan.space',
    'http://localhost:3000',
  ],
})

// ── Routes ──
app.register(require('./routes/index'), { prefix: '/' })

// ── 404 handler ──
app.setNotFoundHandler(async (req, reply) => {
  return reply.code(404).view('404', { title: '404 - Not Found' })
})

// ── Error handler ──
app.setErrorHandler(async (err, req, reply) => {
  app.log.error(err)
  return reply.code(500).send({ error: 'Internal Server Error' })
})

// ── Start ──
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🐙 yfan-tools running on http://localhost:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

module.exports = app
