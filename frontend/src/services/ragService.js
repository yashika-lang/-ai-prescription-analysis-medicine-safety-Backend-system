import { request } from "./apiClient";

// GET /api/rag/status -> { configured: boolean }
export function getRagStatus(authHeader) {
  return request("/api/rag/status", { authHeader });
}

// POST /api/rag/ask?email=&question= -> { answer, sources } or throws ApiError(503/400)
export function askPillie(email, question, authHeader) {
  return request("/api/rag/ask", {
    method: "POST",
    params: { email, question },
    authHeader,
  });
}
