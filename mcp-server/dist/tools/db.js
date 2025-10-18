import { Client } from "pg";
const CONN = process.env.PG_URL || "postgres://user:pass@postgres.tools.svc.cluster.local:5432/app";
function readOnlyCheck(sql) {
    if (/(insert|update|delete|alter|drop|create|grant|revoke|truncate)/i.test(sql)) {
        throw new Error("write queries are disabled");
    }
}
export function dbServer() {
    return {
        name: "db-mcp",
        tools: [
            { name: "query", description: "Run a read-only SQL query", args: [{ name: "sql", type: "string", required: true }] }
        ],
        handlers: {
            async query({ sql }) {
                readOnlyCheck(sql);
                const client = new Client({ connectionString: CONN });
                await client.connect();
                try {
                    const res = await client.query(sql);
                    return { rows: res.rows, rowCount: res.rowCount };
                }
                finally {
                    await client.end();
                }
            }
        }
    };
}
