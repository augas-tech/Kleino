import { request } from "./client";

export const getEspacios = () => request("/espacios");
export const getEspacio = (id) => request(`/espacios/${id}`);
