import axios from "axios";
const ALLOW = (process.env.FETCH_ALLOW || "yirrasystems.com,addiaire.com").split(",").map(s => s.trim());
function allowed(url) {
    try {
        const u = new URL(url);
        return ALLOW.some(dom => u.hostname === dom || u.hostname.endsWith("." + dom));
    }
    catch {
        return false;
    }
}
export function fetchServer() {
    return {
        name: "fetch-mcp",
        tools: [
            { name: "httpGet", description: "GET a URL (allowlist enforced)", args: [{ name: "url", type: "string", required: true }] },
            { name: "httpHead", description: "HEAD a URL (allowlist enforced)", args: [{ name: "url", type: "string", required: true }] }
        ],
        handlers: {
            async httpGet({ url }, req) {
                if (!allowed(url))
                    throw new Error("domain not allowed");
                const { data, status, headers } = await axios.get(url, { headers: pickPassthrough(req) });
                return { status, headers, data };
            },
            async httpHead({ url }, req) {
                if (!allowed(url))
                    throw new Error("domain not allowed");
                const { status, headers } = await axios.head(url, { headers: pickPassthrough(req) });
                return { status, headers };
            }
        }
    };
}
function pickPassthrough(req) {
    // pass Cloudflare Access tokens etc. if you want
    const cid = req.header("CF-Access-Client-Id");
    const csec = req.header("CF-Access-Client-Secret");
    const out = {};
    if (cid)
        out["CF-Access-Client-Id"] = cid;
    if (csec)
        out["CF-Access-Client-Secret"] = csec;
    return out;
}
