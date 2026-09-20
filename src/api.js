const defaultApiUrl = "http://localhost:8000/api/v1";
import { showFailureAlert } from "./alerts";
export const apiUrl = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(
  /\/$/,
  "",
);

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("vibfy_session"));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem("vibfy_session", JSON.stringify(session));
  window.dispatchEvent(new Event('vibfy-session'));
}

export function clearSession() {
  localStorage.removeItem("vibfy_session");
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function errorMessage(response, body) {
  const firstError = Object.values(body.errors || {})[0]?.[0];
  if (firstError) return firstError;
  if (response.status === 401)
    return "Your session has expired. Please log in again.";
  if (response.status === 403)
    return body.message || "You do not have permission to access this portal.";
  if (response.status === 404)
    return "The requested service could not be found.";
  if (response.status === 413)
    return "This upload is too large. Please choose a smaller photo and try again.";
  if (response.status === 429)
    return "Too many attempts. Please wait a minute and try again.";
  if (response.status >= 500)
    return "Vibfy is temporarily unavailable. Please try again shortly.";
  return (
    body.message || "We could not complete your request. Please try again."
  );
}

export async function api(path, options = {}) {
  const { showErrorAlert = true, ...fetchOptions } = options;
  const session = getSession();
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...fetchOptions,
      headers: {
        Accept: "application/json",
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new ApiError(
      "We couldn't connect to Vibfy. Check your internet connection and make sure the API server is running.",
    );
    if (showErrorAlert) showFailureAlert(error.message);
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new ApiError(errorMessage(response, body), response.status);
    error.body = body;
    if (showErrorAlert) showFailureAlert(error.message);
    throw error;
  }
  return body;
}
