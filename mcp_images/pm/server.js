import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MODE = process.env.MODE || 'read-only';
const ALLOWLIST = process.env.ALLOWLIST || 'https://app.yirrasystems.com';
const PM_API_TOKEN = process.env.PM_API_TOKEN || '';

// tools.json mounted at /app/tools.json
let toolsConfig = { tools: [] };
try {
  toolsConfig = JSON.parse(require('fs').readFileSync('/app/tools.json', 'utf8'));
} catch (e) {
  // default basic tool
  toolsConfig = { baseUrl: ALLOWLIST, tools: [] };
}

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (event, data) => res.write(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`);
  send('ready', { status: 'ok' });
  send('tools', { tools: toolsConfig.tools });
  const iv = setInterval(() => send('ping', { t: Date.now() }), 15000);
  req.on('close', () => clearInterval(iv));
});

app.post('/invoke', async (req, res) => {
  try {
    const { tool, params } = req.body || {};
    const def = (toolsConfig.tools || []).find(t => t.name === tool);
    if (!def) return res.status(400).json({ error: 'unknown_tool' });
    if (MODE !== 'write' && def.method && def.method.toUpperCase() !== 'GET') {
      return res.status(403).json({ error: 'MCP_WRITE_DISABLED' });
    }
    const base = toolsConfig.baseUrl || ALLOWLIST;
    let path = def.path || '/';
    if (def.pathParams && params) {
      for (const p of def.pathParams) {
        path = path.replace(`{${p}}`, encodeURIComponent(params[p] ?? ''));
      }
    }
    const url = new URL(path, base).toString();
    const headers = { 'Content-Type': 'application/json' };
    if (toolsConfig.auth && toolsConfig.auth.type === 'header') {
      const v = PM_API_TOKEN;
      if (v) headers[toolsConfig.auth.name] = v;
    }
    const resp = await fetch(url, {
      method: def.method || 'GET',
      headers,
      body: def.method && def.method.toUpperCase() !== 'GET' ? JSON.stringify(params?.body || {}) : undefined
    });
    const text = await resp.text();
    res.status(200).json({ status: resp.status, body: text });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`pm-mcp listening on ${PORT} mode=${MODE}`);
});



















