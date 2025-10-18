import fs from "node:fs/promises";
import path from "node:path";
const ROOTS = (process.env.FS_ROOTS || "/data").split(",").map(s => s.trim());
function resolveSafe(p) {
    const abs = path.resolve(p);
    const inside = ROOTS.some(root => abs.startsWith(path.resolve(root) + path.sep) || abs === path.resolve(root));
    if (!inside)
        throw new Error("path outside allowed roots");
    return abs;
}
export function fsServer() {
    return {
        name: "fs-mcp",
        tools: [
            { name: "listDir", description: "List directory entries", args: [{ name: "dir", type: "string", required: true }] },
            { name: "readFile", description: "Read a text file", args: [{ name: "file", type: "string", required: true }] }
        ],
        handlers: {
            async listDir({ dir }) {
                const d = resolveSafe(dir);
                const entries = await fs.readdir(d, { withFileTypes: true });
                return entries.map(e => ({ name: e.name, type: e.isDirectory() ? "dir" : "file" }));
            },
            async readFile({ file }) {
                const f = resolveSafe(file);
                const buf = await fs.readFile(f);
                // Return text; adjust if you need binary/base64
                return { path: f, content: buf.toString("utf8") };
            }
        }
    };
}
