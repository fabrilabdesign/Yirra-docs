export function sseHandler(server) {
    return (req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        const payload = {
            name: server.name,
            tools: server.tools,
            ts: new Date().toISOString(),
        };
        res.write(`event: schema\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        const keepalive = setInterval(() => {
            res.write(`event: ping\ndata: {}\n\n`);
        }, 15000);
        req.on("close", () => clearInterval(keepalive));
    };
}
export function healthz(_req, res) {
    res.status(200).send("ok");
}
export function invokeHandler(server) {
    return async (req, res) => {
        const { tool, args } = req.body ?? {};
        if (!tool || typeof tool !== "string") {
            return res.status(400).json({ ok: false, error: "missing tool" });
        }
        const handler = server.handlers[tool];
        if (!handler)
            return res.status(404).json({ ok: false, error: "unknown tool" });
        try {
            const result = await handler(args ?? {}, req);
            res.json({ ok: true, result });
        }
        catch (e) {
            res.status(500).json({ ok: false, error: e?.message || String(e) });
        }
    };
}
