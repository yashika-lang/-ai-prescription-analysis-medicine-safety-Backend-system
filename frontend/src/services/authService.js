import { request } from "./apiClient";

// POST /api/user/register - public, body: User JSON
export function register({ name, email, password, age, gender, illnesses }) {
  return request("/api/user/register", {
    method: "POST",
    json: { name, email, password, age, gender, illnesses },
  });
}

// POST /api/user/login - public, body: {email, password} -> {status, name, email} or 401/404
export function login({ email, password }) {
  return request("/api/user/login", {
    method: "POST",
    json: { email, password },
  });
}
