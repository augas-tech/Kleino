import { request, saveToken, clearToken } from "./client";

export async function login(email, password) {
  const data = await request("/session", {
    method: "POST",
    body: { email_address: email.trim(), password },
    auth: false,
  });
  if (!data?.token) throw new Error("La API no devolvió un token de sesión.");
  await saveToken(data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  const data = await request("/session");
  return data.user;
}

export async function logout() {
  try {
    await request("/session", { method: "DELETE" });
  } catch {
    // aunque falle la API, se borra el token local
  } finally {
    await clearToken();
  }
}
