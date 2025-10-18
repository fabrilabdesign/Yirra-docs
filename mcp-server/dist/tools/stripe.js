import axios from "axios";
const STRIPE_API = "https://api.stripe.com/v1";
const KEY = process.env.STRIPE_KEY || "";
function auth() {
    if (!KEY)
        throw new Error("STRIPE_KEY not configured");
    return { auth: { username: KEY, password: "" } };
}
export function stripeServer() {
    return {
        name: "stripe-mcp",
        tools: [
            { name: "getCustomer", description: "Fetch a Stripe customer by ID", args: [{ name: "id", type: "string", required: true }] },
            { name: "listInvoices", description: "List invoices for a customer", args: [{ name: "customer", type: "string", required: true }] }
        ],
        handlers: {
            async getCustomer({ id }) {
                const { data } = await axios.get(`${STRIPE_API}/customers/${id}`, auth());
                return data;
            },
            async listInvoices({ customer }) {
                const { data } = await axios.get(`${STRIPE_API}/invoices`, { ...auth(), params: { customer, limit: 20 } });
                return data;
            }
        }
    };
}
