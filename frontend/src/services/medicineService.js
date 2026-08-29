import { request } from "./apiClient";

// GET /api/medicine/all -> Medicine[]
export function getAllMedicines(authHeader) {
  return request("/api/medicine/all", { authHeader });
}
