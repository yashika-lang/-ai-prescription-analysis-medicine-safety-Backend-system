import { request } from "./apiClient";

// GET /api/user/allergies?email= -> string[]
export function getAllergies(email, authHeader) {
  return request("/api/user/allergies", { params: { email }, authHeader });
}

// POST /api/user/add-allergy?email=&allergy= -> string message
export function addAllergy(email, allergy, authHeader) {
  return request("/api/user/add-allergy", {
    method: "POST",
    params: { email, allergy },
    authHeader,
  });
}

// POST /api/user/add-allergies?email= body: string[] -> string message
export function addAllergies(email, allergies, authHeader) {
  return request("/api/user/add-allergies", {
    method: "POST",
    params: { email },
    json: allergies,
    authHeader,
  });
}
