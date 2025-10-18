import express from 'express';
import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MODE = process.env.MODE || 'read-only';
const ROOTS_JSON = process.env.ROOTS_JSON || '["/data/docs","/data/shop"]';
const MAX_BYTES = parseInt(process.env.MAX_BYTES || '1048576', 10);
const roots = JSON.parse(ROOTS_JSON);

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (e, d) => res.write(`event: ${e}\n` + `data: ${JSON.stringify(d)}\n\n`);
  send('ready', { status: 'ok' });
  send('tools', { tools: [
    { name: 'list', params: { path: 'string' } },
    { name: 'read', params: { path: 'string' } },
    { name: 'search', params: { pattern: 'string' } },
    { name: 'write', params: { path: 'string', content: 'string' } }
  ]});
  const iv = setInterval(() => send('ping', { t: Date.now() }), 15000);
  req.on('close', () => clearInterval(iv));
});

function isUnderRoots(p) {
  const rp = path.resolve(p);
  return roots.some(r => rp.startsWith(path.resolve(r) + path.sep) || rp === path.resolve(r));
}

app.post('/invoke', async (req, res) => {
  try {
    const { tool, params } = req.body || {};
    if (tool === 'list') {
      const p = params?.path; const ap = path.resolve(p);
      if (!isUnderRoots(ap)) return res.status(403).json({ error: 'forbidden' });
      const entries = fs.readdirSync(ap, { withFileTypes: true }).map(d => ({ name: d.name, dir: d.isDirectory() }));
      return res.json({ entries });
    }
    if (tool === 'read') {
      const p = params?.path; const ap = path.resolve(p);
      if (!isUnderRoots(ap)) return res.status(403).json({ error: 'forbidden' });
      const stat = fs.statSync(ap);
      if (stat.size > MAX_BYTES) return res.status(413).json({ error: 'too_large' });
      return res.json({ content: fs.readFileSync(ap, 'utf8') });
    }
    if (tool === 'search') {
      const pattern = params?.pattern || '**/*';
      const matches = [];
      for (const r of roots) {
        matches.push(...await fg(pattern, { cwd: r, onlyFiles: true }));
      }
      return res.json({ matches });
    }
    if (tool === 'write') {
      if (MODE !== 'write') return res.status(403).json({ error: 'MCP_WRITE_DISABLED' });
      const p = params?.path; const ap = path.resolve(p);
      if (!isUnderRoots(ap)) return res.status(403).json({ error: 'forbidden' });
      fs.mkdirSync(path.dirname(ap), { recursive: true });
      fs.writeFileSync(ap, params?.content ?? '', 'utf8');
      return res.json({ ok: true });
    }
    return res.status(400).json({ error: 'unknown_tool' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`fs-mcp on ${PORT} mode=${MODE}`));



















