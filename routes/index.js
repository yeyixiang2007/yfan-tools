const ejs = require('ejs')
const path = require('path')
const fs = require('fs')

// ── 分类定义 ──
const categories = [
  { id: 'all',    name: '全部',         icon: '📦' },
  { id: 'doc',    name: '文档处理',     icon: '📄' },
  { id: 'encode', name: '编码/转换',    icon: '🔄' },
  { id: 'dev',    name: '开发调试',     icon: '🛠️' },
  { id: 'gen',    name: '生成创建',     icon: '✨' },
  { id: 'info',   name: '信息查询',     icon: '🔍' },
  { id: 'text',   name: '文本处理',     icon: '📝' },
]

const tools = [

  // ── 文档处理 ──
  { id: 'md2pdf',    name: 'Markdown → PDF',  desc: '将 Markdown 文档转换为格式美观的 PDF',  icon: '📄', category: 'doc' },
  { id: 'markdown',  name: 'Markdown 格式化',   desc: 'Markdown 源码格式化、表格对齐、实时预览', icon: '📝', category: 'doc' },

  // ── 编码/转换 ──
  { id: 'base64',    name: 'Base64 编解码',     desc: 'Base64 编码与解码，支持中文',          icon: '🔐', category: 'encode' },
  { id: 'urlcodec',  name: 'URL 编解码',        desc: 'URL 编码与解码，支持参数解析',         icon: '🔗', category: 'encode' },
  { id: 'htmlescape',name: 'HTML 实体转义',     desc: 'HTML 特殊字符编码与解码，支持预览',    icon: '🏷️', category: 'encode' },
  { id: 'baseconv',  name: '进制转换',          desc: '二进制/八进制/十进制/十六进制互转',    icon: '🔢', category: 'encode' },

  // ── 开发调试 ──
  { id: 'json',      name: 'JSON 格式化',       desc: 'JSON 格式化、压缩、校验',              icon: '🔧', category: 'dev' },
  { id: 'diff',      name: '代码 Diff 对比',    desc: '两段文本/代码差异对比，LCS 算法',      icon: '📊', category: 'dev' },
  { id: 'regex',     name: '正则表达式测试',    desc: '正则匹配、替换、高亮预览',            icon: '🔍', category: 'dev' },
  { id: 'cron',      name: 'Cron 表达式生成',   desc: '可视化生成 cron 语法，预览执行时间',   icon: '⏱️', category: 'dev' },
  { id: 'hash',      name: 'Hash 生成器',       desc: 'MD5/SHA-1/SHA-256/SHA-512 哈希计算',  icon: '🔑', category: 'dev' },
  { id: 'jwt',       name: 'JWT 解码器',        desc: '解码 JWT Token，查看 Header/Payload',  icon: '🔐', category: 'dev' },
  { id: 'color',     name: '颜色工具',          desc: 'HEX/RGB/HSL 颜色空间互转',            icon: '🎨', category: 'dev' },

  // ── 生成创建 ──
  { id: 'password',  name: '密码生成器',        desc: '可配置的强密码批量生成',              icon: '🔑', category: 'gen' },
  { id: 'uuid',      name: 'UUID 生成器',       desc: '批量生成 UUID v4/v7',                 icon: '🆔', category: 'gen' },
  { id: 'qrcode',    name: '二维码生成',        desc: '输入文本生成可下载的二维码图片',        icon: '📱', category: 'gen' },

  // ── 信息查询 ──
  { id: 'ip',        name: 'IP 信息查询',       desc: '查询 IP 归属地、运营商、ASN 等信息',   icon: '🌐', category: 'info' },
  { id: 'timestamp', name: '时间戳转换',        desc: 'Unix 时间戳 ↔ 日期时间互转',          icon: '⏰', category: 'info' },

  // ── 文本处理 ──
  { id: 'counter',   name: '文本统计',          desc: '字符、单词、行数、中文字数实时统计',    icon: '📊', category: 'text' },
  { id: 'textsort',  name: '文本排序/去重',      desc: '升序/降序/去重/打乱/添加行号等',        icon: '📋', category: 'text' },
]

const viewDir = path.join(__dirname, '..', 'views')

// 缓存模板
const layoutTpl = ejs.compile(fs.readFileSync(path.join(viewDir, 'layout.ejs'), 'utf-8'))

function renderWithLayout(tplName, data) {
  const tplPath = path.join(viewDir, tplName + '.ejs')
  const tpl = ejs.compile(fs.readFileSync(tplPath, 'utf-8'))
  const content = tpl({ ...data })
  return layoutTpl({ ...data, content })
}

module.exports = async function (fastify, opts) {
  // ── Home ──
  fastify.get('/', async (req, reply) => {
    return reply.type('text/html').send(renderWithLayout('index', { categories, tools, title: 'yfan.tools' }))
  })

  // ── Tool pages ──
  for (const tool of tools) {
    const routePath = `/${tool.id}`

    fastify.get(routePath, async (req, reply) => {
      return reply.type('text/html').send(renderWithLayout(tool.id, {
        title: `${tool.name} - yfan.tools`,
        tool,
        tools,
        categories,
      }))
    })
  }

  // ── IP 查询 API ──
  // ── HTTP GET with timeout ──
  function httpGet(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const u = new URL(url)
      const mod = u.protocol === 'https:' ? require('https') : require('http')
      const req = mod.get(url, (res) => {
        let data = ''
        res.on('data', c => data += c)
        res.on('end', () => resolve(data))
      })
      req.on('error', reject)
      req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')) })
    })
  }

  fastify.get('/ip/lookup', async (req, reply) => {
    const { ip, myip } = req.query

    try {
      let targetIP = ip

      if (myip) {
        targetIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.ip
        const isPrivate = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.)/.test(targetIP) ||
                          targetIP === '::1' || targetIP === '127.0.0.1'
        if (isPrivate) {
          const raw = await httpGet('http://ip-api.com/json/?fields=query')
          targetIP = JSON.parse(raw).query
        }
      }

      if (!targetIP) {
        return reply.send({ error: 'IP address is required' })
      }

      const raw = await httpGet(`http://ip-api.com/json/${targetIP}?fields=status,message,query,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`)
      const data = JSON.parse(raw)

      if (data.status === 'fail') {
        return reply.send({ error: data.message || '查询失败' })
      }

      return reply.send(data)
    } catch (err) {
      return reply.code(500).send({ error: '查询失败: ' + err.message })
    }
  })

  // ── md2pdf: 后端 PDF 生成 ──
  fastify.post('/md2pdf/render', async (req, reply) => {
    const { markdown, margin, fontSize } = req.body
    if (!markdown) {
      return reply.code(400).send({ error: 'markdown content is required' })
    }

    const tmpDir = '/tmp/yfan-md2pdf'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const mdPath = path.join(tmpDir, `input_${Date.now()}.md`)
    const pdfPath = path.join(tmpDir, `output_${Date.now()}.pdf`)

    fs.writeFileSync(mdPath, markdown, 'utf-8')

    try {
      const { execSync } = require('child_process')
      const cmd = `/root/workspace/md2pdf/bin/md2pdf ${mdPath} -o ${pdfPath}${margin ? ' --margin ' + margin : ''}${fontSize ? ' --font-size ' + fontSize : ''}`
      execSync(cmd, { timeout: 30000 })

      const pdfBuf = fs.readFileSync(pdfPath)

      // Cleanup
      setTimeout(() => {
        try { fs.unlinkSync(mdPath); fs.unlinkSync(pdfPath) } catch {}
      }, 5000)

      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename=yfan-document.pdf')
        .send(pdfBuf)
    } catch (err) {
      // Try cleanup
      try { fs.unlinkSync(mdPath) } catch {}
      try { fs.unlinkSync(pdfPath) } catch {}
      return reply.code(500).send({ error: 'PDF generation failed: ' + err.message })
    }
  })
}
