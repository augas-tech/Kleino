jest.mock("expo-secure-store", () => {
  let store = {};
  return {
    getItemAsync: jest.fn(async (k) => store[k] ?? null),
    setItemAsync: jest.fn(async (k, v) => { store[k] = v; }),
    deleteItemAsync: jest.fn(async (k) => { delete store[k]; }),
    __reset: () => { store = {}; },
  };
});

import * as SecureStore from "expo-secure-store";
import { getToken, request, saveToken, setUnauthorizedHandler } from "../src/api/client";

const respuesta = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => (body === undefined ? null : "application/json") },
  json: async () => body,
});

beforeEach(() => {
  SecureStore.__reset();
  global.fetch = jest.fn();
  setUnauthorizedHandler(null);
});

describe("cliente HTTP", () => {
  test("envía el token como Bearer y el header X-Client", async () => {
    await saveToken("abc123");
    fetch.mockResolvedValue(respuesta(200, []));
    await request("/espacios");
    const { headers } = fetch.mock.calls[0][1];
    expect(headers.Authorization).toBe("Bearer abc123");
    expect(headers["X-Client"]).toBe("mobile");
  });

  test("no envía Authorization en el login", async () => {
    await saveToken("abc123");
    fetch.mockResolvedValue(respuesta(201, { user: {}, token: "t" }));
    await request("/session", { method: "POST", body: {}, auth: false });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test("un 401 borra el token y vuelve al login", async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    await saveToken("vencido");
    fetch.mockResolvedValue(respuesta(401, { error: "Debes iniciar sesión" }));
    await expect(request("/reservas")).rejects.toMatchObject({ status: 401 });
    expect(await getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  test("un 403 muestra el mensaje del servidor", async () => {
    fetch.mockResolvedValue(respuesta(403, { error: "No tienes permiso para realizar esta acción" }));
    await expect(request("/sedes", { method: "POST" }))
      .rejects.toMatchObject({ status: 403, message: "No tienes permiso para realizar esta acción" });
  });

  test("un 422 junta los errores de validación", async () => {
    fetch.mockResolvedValue(respuesta(422, { errors: ["El horario se solapa", "Fecha inválida"] }));
    await expect(request("/reservas", { method: "POST" }))
      .rejects.toMatchObject({ status: 422, message: "El horario se solapa\nFecha inválida" });
  });

  test("un 429 sin mensaje usa un texto amigable", async () => {
    fetch.mockResolvedValue(respuesta(429, {}));
    await expect(request("/session")).rejects.toMatchObject({ status: 429, message: expect.stringContaining("Demasiados intentos") });
  });

  test("un fallo de red se muestra como problema de conexión", async () => {
    fetch.mockRejectedValue(new TypeError("Network request failed"));
    await expect(request("/espacios")).rejects.toMatchObject({ status: 0, message: expect.stringContaining("No pudimos conectar") });
  });
});
