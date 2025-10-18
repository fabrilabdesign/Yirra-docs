import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const ALLOWLIST_REGEX = new RegExp(process.env.ALLOWLIST_REGEX || '^(https://(yirrasystems\\.com|app\\.yirrasystems\\.com|flows\\.addiaire\\.com))$');
const MAX_BODY_BYTES = parseInt(process.env.MAX_BODY_BYTES || '1048576', 10);
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10);
const HTML_TO_MD = (process.env.HTML_TO_MD || 'true') === 'true';

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (e, d) => res.write(`event: ${e}\n` + `data: ${JSON.stringify(d)}\n\n`);
  send('ready', { status: 'ok' });
  send('tools', { tools: [ { name: 'request', params: { method: 'string', url: 'string', body: 'object?' } } ]});
  const iv = setInterval(() => send('ping', { t: Date.now() }), 15000);
  req.on('close', () => clearInterval(iv));
});

app.post('/invoke', async (req, res) => {
  try {
    const { tool, params } = req.body || {};
    if (tool !== 'request') return res.status(400).json({ error: 'unknown_tool' });
    const url = params?.url || '';
    if (!ALLOWLIST_REGEX.test(url)) return res.status(403).json({ error: 'domain_not_allowed' });
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const r = await fetch(url, {
      method: (params?.method || 'GET').toUpperCase(),
      body: params?.body ? JSON.stringify(params.body) : undefined,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(to);
    let text = await r.text();
    if (HTML_TO_MD && (r.headers.get('content-type') || '').includes('text/html')) {
      text = text.replace(/<[^>]+>/g, '');
    }
    if (text.length > MAX_BODY_BYTES) text = text.slice(0, MAX_BODY_BYTES);
    return res.json({ status: r.status, body: text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`fetch-mcp on ${PORT}`));



















