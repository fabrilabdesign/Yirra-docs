import axios from "axios";
const N8N_BASE = process.env.N8N_BASE_URL || "http://n8n.tools.svc.cluster.local:5678";
export function n8nServer() {
    return {
        name: "n8n-mcp",
        tools: [
            { name: "listWorkflows", description: "List all workflows", args: [] },
            { name: "getWorkflow", description: "Get workflow by ID", args: [{ name: "workflowId", type: "string", required: true }] },
            { name: "triggerWorkflow", description: "Trigger a workflow by ID", args: [{ name: "workflowId", type: "string", required: true }, { name: "data", type: "object", required: false }] }
        ],
        handlers: {
            async listWorkflows() {
                const { data } = await axios.get(`${N8N_BASE}/api/v1/workflows`);
                return data.data;
            },
            async getWorkflow({ workflowId }) {
                if (!workflowId)
                    throw new Error("workflowId required");
                const { data } = await axios.get(`${N8N_BASE}/api/v1/workflows/${workflowId}`);
                return data;
            },
            async triggerWorkflow({ workflowId, data = {} }) {
                if (!workflowId)
                    throw new Error("workflowId required");
                const { data: result } = await axios.post(`${N8N_BASE}/api/v1/workflows/${workflowId}/test`, data);
                return result;
            }
        }
    };
}
