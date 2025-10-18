import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const N8N_API_KEY = process.env.N8N_API_KEY || '';

let toolsConfig = { workflows: [], authHeader: 'X-API-Key' };
try {
  toolsConfig = JSON.parse(fs.readFileSync('/app/tools.json', 'utf8'));
} catch {}

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (e, d) => res.write(`event: ${e}\n` + `data: ${JSON.stringify(d)}\n\n`);
  send('ready', { status: 'ok' });
  send('tools', { tools: toolsConfig.workflows.map(w => ({ name: w.name })) });
  const iv = setInterval(() => send('ping', { t: Date.now() }), 15000);
  req.on('close', () => clearInterval(iv));
});

app.post('/invoke', async (req, res) => {
  try {
    const { tool, params } = req.body || {};
    const wf = (toolsConfig.workflows || []).find(w => w.name === tool);
    if (!wf) return res.status(400).json({ error: 'unknown_tool' });
    const headers = { 'Content-Type': 'application/json' };
    if (toolsConfig.authHeader && N8N_API_KEY) headers[toolsConfig.authHeader] = N8N_API_KEY;
    const r = await fetch(wf.url, { method: wf.method || 'POST', headers, body: JSON.stringify(params || {}) });
    const text = await r.text();
    return res.json({ status: r.status, body: text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`n8n-mcp on ${PORT}`));



















