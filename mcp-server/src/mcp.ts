import type { Request, Response } from "express";

export type ToolArgSpec = { name: string; type: string; required?: boolean; description?: string };
export type ToolSpec = { name: string; description: string; args: ToolArgSpec[] };

export type ToolHandler = (args: Record<string, any>, req: Request) => Promise<any>;

export interface McpServer {
  name: string;
  tools: ToolSpec[];
  handlers: Record<string, ToolHandler>;
}

export function sseHandler(server: McpServer) {
  return (req: Request, res: Response) => {
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

export function healthz(_req: Request, res: Response) {
  res.status(200).send("ok");
}

export function invokeHandler(server: McpServer) {
  return async (req: Request, res: Response) => {
    const { tool, args } = req.body ?? {};
    if (!tool || typeof tool !== "string") {
      return res.status(400).json({ ok: false, error: "missing tool" });
    }
    const handler = server.handlers[tool];
    if (!handler) return res.status(404).json({ ok: false, error: "unknown tool" });
    try {
      const result = await handler(args ?? {}, req);
      res.json({ ok: true, result });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  };
}








