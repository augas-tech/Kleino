import { validarEspacio } from "../src/utils/validaciones";

const base = { nombre: "Sala A", capacidad: "6", sede_id: 1, hora_apertura: "09:00", hora_cierre: "18:00" };

describe("validarEspacio", () => {
  test("un espacio completo no tiene errores", () => {
    expect(validarEspacio(base)).toEqual([]);
  });
  test("exige nombre", () => {
    expect(validarEspacio({ ...base, nombre: "  " })).toContain("El nombre es obligatorio.");
  });
  test("la capacidad debe ser mayor a 0", () => {
    expect(validarEspacio({ ...base, capacidad: "0" })).toContain("La capacidad debe ser un número mayor a 0.");
  });
  test("rechaza un horario mal escrito", () => {
    expect(validarEspacio({ ...base, hora_apertura: "9" })).toContain("El horario debe tener formato HH:MM.");
  });
  test("la hora de cierre debe ser posterior a la apertura", () => {
    expect(validarEspacio({ ...base, hora_apertura: "18:00", hora_cierre: "09:00" }))
      .toContain("La hora de cierre debe ser posterior a la de apertura.");
  });
});
