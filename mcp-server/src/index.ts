import express from "express";
import bodyParser from "body-parser";
import { healthz, sseHandler, invokeHandler, McpServer } from "./mcp.js";
import { fetchServer } from "./tools/fetch.js";
import { n8nServer } from "./tools/n8n.js";
import { pmServer } from "./tools/pm.js";
import { fsServer } from "./tools/fs.js";
import { gitServer } from "./tools/git.js";
import { dbServer } from "./tools/db.js";
import { stripeServer } from "./tools/stripe.js";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

function chooseServer(): McpServer {
  switch ((process.env.MCP_KIND || "fetch").toLowerCase()) {
    case "fetch": return fetchServer();
    case "n8n": return n8nServer();
    case "pm": return pmServer();
    case "fs": return fsServer();
    case "git": return gitServer();
    case "db": return dbServer();
    case "stripe": return stripeServer();
    default: throw new Error(`Unknown MCP_KIND: ${process.env.MCP_KIND}`);
  }
}

const server = chooseServer();
app.get("/healthz", healthz);
app.get("/sse", sseHandler(server));
app.post("/invoke", invokeHandler(server));

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`[${server.name}] listening on :${PORT}`));
