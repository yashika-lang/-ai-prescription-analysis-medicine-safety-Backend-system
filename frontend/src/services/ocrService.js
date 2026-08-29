import { request } from "./apiClient";

// POST /api/ocr/upload-prescription - multipart: file, email -> { rawOcrText, medicines: [...] }
export function uploadPrescription(file, email, authHeader) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", email);
  return request("/api/ocr/upload-prescription", {
    method: "POST",
    formData,
    authHeader,
  });
}

// POST /api/ocr/analyze-prescription - form body: text, email -> medicine[]
export function analyzePrescriptionText(text, email, authHeader) {
  return request("/api/ocr/analyze-prescription", {
    method: "POST",
    form: { text, email },
    authHeader,
  });
}
