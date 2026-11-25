import { fechaLarga, hhmm, parseISODate, tipoLabel, toHHMM, toISODate } from "../src/utils/format";

describe("utilidades de formato", () => {
  test("hhmm extrae la hora del ISO que devuelve Rails", () => {
    expect(hhmm("2000-01-01T10:30:00.000Z")).toBe("10:30");
  });
  test("hhmm acepta un HH:MM directo", () => {
    expect(hhmm("09:05")).toBe("09:05");
  });
  test("hhmm devuelve vacío si no hay valor", () => {
    expect(hhmm(null)).toBe("");
  });
  test("toISODate usa la fecha local", () => {
    expect(toISODate(new Date(2026, 10, 5))).toBe("2026-11-05");
  });
  test("toHHMM rellena con ceros", () => {
    expect(toHHMM(new Date(2026, 0, 1, 8, 7))).toBe("08:07");
  });
  test("parseISODate no se corre un día por la zona horaria", () => {
    const d = parseISODate("2026-12-25");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 25]);
  });
  test("fechaLarga muestra día y mes en español", () => {
    expect(fechaLarga("2026-11-24")).toBe("mar 24 nov 2026");
  });
  test("tipoLabel convierte el tipo en texto legible", () => {
    expect(tipoLabel("sala_reunion")).toBe("Sala reunion");
  });
});
