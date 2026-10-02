import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Force Node.js runtime — the Neon DB driver requires it
export const runtime = "nodejs";
