import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "kleino_token";
const TIMEOUT_MS = 10000;

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const saveToken = (t) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const MESSAGES = {
  401: "Tu sesión expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  422: "Revisa los datos ingresados.",
  429: "Demasiados intentos. Espera un momento e inténtalo otra vez.",
};

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client": "mobile",
  };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) throw new ApiError("Falta configurar EXPO_PUBLIC_API_URL en mobile/.env.", 0);

  let res;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    res = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("No pudimos conectar con el servidor. Revisa tu conexión.", 0);
  } finally {
    clearTimeout(timer);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;
  if (res.ok) return data;

  if (res.status === 401 && auth) {
    await clearToken();
    onUnauthorized?.();
    throw new ApiError(MESSAGES[401], 401);
  }

  const serverMsg = data?.errors?.join("\n") ?? data?.error;
  throw new ApiError(serverMsg ?? MESSAGES[res.status] ?? "Ocurrió un error inesperado.", res.status);
}
