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
  { id: 'media',  name: '多媒体',       icon: '🎨' },
]

const tools = [

  // ── 文档处理 ──
  { id: 'md2pdf',    name: 'Markdown → PDF',  desc: '将 Markdown 文档转换为格式美观的 PDF',  icon: '📄', category: 'doc' },
  { id: 'markdown',  name: 'Markdown 格式化',   desc: 'Markdown 源码格式化、表格对齐、实时预览', icon: '📝', category: 'doc' },
  { id: 'csv',       name: 'CSV 查看器',         desc: 'CSV 格式化浏览、CSV↔JSON 互转',        icon: '📊', category: 'doc' },
  { id: 'diffcheck', name: '文本差异对比',         desc: 'LCS 算法逐行对比两段文本差异',           icon: '📑', category: 'doc' },
  { id: 'pdf',       name: 'PDF 合并/拆分',        desc: '合并多个 PDF、提取指定页、每页拆分',      icon: '📎', category: 'doc' },

  // ── 多媒体 ──
  { id: 'image',     name: '图片处理',           desc: '图片压缩/格式转换/尺寸调整',               icon: '🖼️', category: 'media' },
  { id: 'colorpicker',name: '颜色拾取器',          desc: '可视化调色板，HEX/RGB/HSL/CMYK 互转',     icon: '🎨', category: 'media' },

  // ── 编码/转换 ──
  { id: 'base64',    name: 'Base64 编解码',     desc: 'Base64 编码与解码，支持中文',          icon: '🔐', category: 'encode' },
  { id: 'urlcodec',  name: 'URL 编解码',        desc: 'URL 编码与解码，支持参数解析',         icon: '🔗', category: 'encode' },
  { id: 'htmlescape',name: 'HTML 实体转义',     desc: 'HTML 特殊字符编码与解码，支持预览',    icon: '🏷️', category: 'encode' },
  { id: 'baseconv',  name: '进制转换',          desc: '二进制/八进制/十进制/十六进制互转',    icon: '🔢', category: 'encode' },
  { id: 'morse',     name: '摩尔斯电码',         desc: '文字与摩尔斯电码互转，支持音频播放',    icon: '📡', category: 'encode' },
  { id: 'roman',     name: '罗马数字转换',       desc: '阿拉伯数字与罗马数字互转',             icon: '🏛️', category: 'encode' },
  { id: 'unicode',   name: 'Unicode 工具',       desc: 'Unicode 编码/解码，多种格式输出',      icon: '🔣', category: 'encode' },
  { id: 'rot13',     name: 'ROT13/凯撒密码',      desc: 'ROT13/Rot-N 加密解密，暴力破解',        icon: '🔐', category: 'encode' },
  { id: 'cipher',    name: '经典密码',            desc: '凯撒/Vigenère/Atbash/ROT47 加解密',   icon: '🔏', category: 'encode' },

  // ── 开发调试 ──
  { id: 'json',      name: 'JSON 格式化',       desc: 'JSON 格式化、压缩、校验',              icon: '🔧', category: 'dev' },
  { id: 'regex',     name: '正则表达式测试',    desc: '正则匹配、替换、高亮预览',            icon: '🔍', category: 'dev' },
  { id: 'cron',      name: 'Cron 表达式生成',   desc: '可视化生成 cron 语法，预览执行时间',   icon: '⏱️', category: 'dev' },
  { id: 'hash',      name: 'Hash 生成器',       desc: 'MD5/SHA-1/SHA-256/SHA-512 哈希计算',  icon: '🔑', category: 'dev' },
  { id: 'jwt',       name: 'JWT 解码器',        desc: '解码 JWT Token，查看 Header/Payload',  icon: '🔐', category: 'dev' },
  { id: 'color',     name: '颜色工具',          desc: 'HEX/RGB/HSL 颜色空间互转',            icon: '🎨', category: 'dev' },
  { id: 'yaml',      name: 'YAML/JSON 互转',     desc: 'YAML 与 JSON 格式双向转换',            icon: '📋', category: 'dev' },
  { id: 'xml',       name: 'XML 格式化',         desc: 'XML 格式化、压缩、校验',               icon: '📄', category: 'dev' },
  { id: 'sql',       name: 'SQL 格式化',         desc: 'SQL 关键字大写、格式化与压缩',         icon: '🗄️', category: 'dev' },
  { id: 'toml',      name: 'TOML 格式化',         desc: 'TOML 格式化与 JSON 互转',              icon: '📋', category: 'dev' },
  { id: 'ini',       name: 'INI 格式化',          desc: 'INI 格式化与 JSON 互转',               icon: '⚙️', category: 'dev' },
  { id: 'http',      name: 'HTTP 状态码查询',       desc: 'HTTP 状态码速查与搜索',                 icon: '📡', category: 'dev' },
  { id: 'mime',      name: 'MIME 类型查询',         desc: 'MIME 类型/扩展名速查',                 icon: '📎', category: 'dev' },
  { id: 'tablegen',  name: '表格生成器',           desc: 'Markdown/HTML/Grid 表格生成',            icon: '📋', category: 'dev' },
  { id: 'htmlpreview',name: 'HTML 实时预览',        desc: 'HTML 源码编辑与实时渲染预览',             icon: '🌍', category: 'dev' },

  // ── 生成创建 ──
  { id: 'password',  name: '密码生成器',        desc: '可配置的强密码批量生成',              icon: '🔑', category: 'gen' },
  { id: 'uuid',      name: 'UUID 生成器',       desc: '批量生成 UUID v4/v7',                 icon: '🆔', category: 'gen' },
  { id: 'qrcode',    name: '二维码生成',        desc: '输入文本生成可下载的二维码图片',        icon: '📱', category: 'gen' },
  { id: 'barcode',   name: '条形码生成',          desc: '支持 CODE128/EAN13/UPC 等格式',        icon: '🏷️', category: 'gen' },
  { id: 'lorem',     name: 'Lorem Ipsum',         desc: 'Lorem Ipsum 假文生成器（单词/句子/段落）', icon: '📝', category: 'gen' },
  { id: 'emoji',     name: 'Emoji 搜索',           desc: 'Emoji 搜索与复制（分类/关键字搜索）',   icon: '😊', category: 'gen' },
  { id: 'charts',    name: 'ASCII 图表',           desc: '柱状图/折线图/饼图 ASCII 图表生成',      icon: '📈', category: 'gen' },
  { id: 'placeholder',name: '占位图生成器',          desc: '生成 SVG/PNG 占位图，自定义尺寸/颜色/文字', icon: '🖼️', category: 'gen' },
  { id: 'codesnap',  name: '代码截图美化',         desc: '代码高亮卡片，多主题/背景/语言，导出图片', icon: '📸', category: 'gen' },
  { id: 'mermaid',   name: 'Mermaid 流程图',       desc: 'Mermaid 流程图/时序图/类图/甘特图/饼图',  icon: '🔀', category: 'gen' },

  // ── 信息查询 ──
  { id: 'ip',        name: 'IP 信息查询',       desc: '查询 IP 归属地、运营商、ASN 等信息',   icon: '🌐', category: 'info' },
  { id: 'timestamp', name: '时间戳转换',        desc: 'Unix 时间戳 ↔ 日期时间互转',          icon: '⏰', category: 'info' },
  { id: 'mac',       name: 'MAC 地址查询',       desc: '查询 MAC 地址厂商，格式化转换',        icon: '🔌', category: 'info' },
  { id: 'dns',       name: 'DNS 查询',           desc: 'A/AAAA/MX/NS/TXT/CNAME/SOA 记录查询',  icon: '🌐', category: 'info' },
  { id: 'port',      name: '端口查询',           desc: '常用端口查询与速查表',                  icon: '🚪', category: 'info' },
  { id: 'unit',      name: '单位转换器',           desc: '长度/重量/温度/体积/数据等 10 类单位转换', icon: '📏', category: 'info' },
  { id: 'useragent', name: 'UA 解析器',            desc: 'User-Agent 字符串解析，识别浏览器/OS/设备', icon: '🌐', category: 'info' },
  { id: 'exchange',  name: '货币汇率转换',         desc: '实时汇率查询与货币转换（20 种货币）',    icon: '💱', category: 'info' },

  // ── 文本处理 ──
  { id: 'counter',   name: '文本统计',          desc: '字符、单词、行数、中文字数实时统计',    icon: '📊', category: 'text' },
  { id: 'textsort',  name: '文本排序/去重',      desc: '升序/降序/去重/打乱/添加行号等',        icon: '📋', category: 'text' },
  { id: 'caseconv',  name: '字母大小写转换',      desc: '大写/小写/首字母/驼峰/下划线/连字符',  icon: '🔤', category: 'text' },
  { id: 'slug',      name: 'Slug 生成器',         desc: '将标题文本转换为 URL 友好的 Slug',      icon: '🔗', category: 'text' },
  { id: 'palindrome',name: '回文检测',             desc: '回文字符串检测工具，支持中文',          icon: '🔄', category: 'text' },
  { id: 'anagram',   name: '字谜检测',             desc: 'Anagram 字谜检测与全文查找',            icon: '🔀', category: 'text' },
  { id: 'wordcount', name: '词频统计',             desc: '字符/单词/句子统计 + 词频可视化排行榜', icon: '📈', category: 'text' },
  { id: 'palette',  name: '配色提取',           desc: '从图片中提取配色方案',                    icon: '🎨', category: 'media' },
  { id: 'speedtest', name: '网速测试',           desc: '浏览器测速，测试下载/上传/Ping',         icon: '⚡', category: 'info' },
  { id: 'git',       name: 'Git 命令生成器',        desc: '交互式生成 Git 命令，支持分支/提交/远程等', icon: '🔧', category: 'dev' },
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
  // ── Tools API（搜索数据统一来源）───
  fastify.get('/api/tools', async (req, reply) => {
    return reply.send(tools.map(t => ({ id: t.id, name: t.name, desc: t.desc, icon: t.icon })))
  })

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
