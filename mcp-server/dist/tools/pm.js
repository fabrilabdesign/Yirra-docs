import axios from "axios";
const BASE = process.env.PROJECTS_SVC_URL || "http://projects-svc.tools.svc.cluster.local";
export function pmServer() {
    return {
        name: "pm-mcp",
        tools: [
            { name: "listProjects", description: "List projects", args: [] },
            { name: "listTasks", description: "List tasks in a project", args: [{ name: "projectId", type: "string", required: true }] },
            // keep default read-only; add createTask if/when you want write.
        ],
        handlers: {
            async listProjects() {
                const { data } = await axios.get(`${BASE}/api/projects`);
                return data;
            },
            async listTasks({ projectId }) {
                if (!projectId)
                    throw new Error("projectId required");
                const { data } = await axios.get(`${BASE}/api/projects/${projectId}/tasks`);
                return data;
            }
        }
    };
}
