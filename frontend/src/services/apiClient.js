const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function buildBasicAuthHeader(email, password) {
  // btoa only handles Latin1 - encodeURIComponent/unescape roundtrip keeps unicode emails/passwords safe.
  const token = btoa(unescape(encodeURIComponent(`${email}:${password}`)));
  return `Basic ${token}`;
}

let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * @param {string} path - e.g. "/api/medicine/all"
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"DELETE"} [options.method]
 * @param {Record<string,string>} [options.params] - appended as URL query params
 * @param {object|Array} [options.json] - sent as application/json body
 * @param {Record<string,string>} [options.form] - sent as application/x-www-form-urlencoded body
 * @param {FormData} [options.formData] - sent as multipart/form-data
 * @param {string} [options.authHeader] - "Basic ..." value, omitted for public endpoints
 */
export async function request(path, options = {}) {
  const { method = "GET", params, json, form, formData, authHeader } = options;

  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }

  const headers = {};
  if (authHeader) headers.Authorization = authHeader;

  let body;
  if (formData) {
    body = formData; // browser sets multipart boundary automatically
  } else if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form).toString();
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  let response;
  try {
    response = await fetch(url.toString(), { method, headers, body });
  } catch {
    throw new ApiError(0, "Could not reach the Pillie server. Check your connection and try again.");
  }

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && authHeader && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;
    throw new ApiError(response.status, message, data);
  }

  return data;
}
