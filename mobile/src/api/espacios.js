import { request } from "./client";

export const getEspacios = () => request("/espacios");
export const getEspacio = (id) => request(`/espacios/${id}`);
export const createEspacio = (data) => request("/espacios", { method: "POST", body: data });
export const updateEspacio = (id, data) => request(`/espacios/${id}`, { method: "PATCH", body: data });
