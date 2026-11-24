import { request } from "./client";

export const getReservas = () => request("/reservas");
export const createReserva = (data) => request("/reservas", { method: "POST", body: data });
export const updateReserva = (id, data) => request(`/reservas/${id}`, { method: "PATCH", body: data });
export const cancelarReserva = (id) => request(`/reservas/${id}/cancelar`, { method: "PATCH" });
