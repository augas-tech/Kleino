import { fireEvent, render, screen } from "@testing-library/react-native";
import EspacioDetalleScreen from "../src/screens/EspacioDetalleScreen";
import EspaciosScreen from "../src/screens/EspaciosScreen";
import { useAuth } from "../src/auth/AuthContext";
import { getEspacios } from "../src/api/espacios";

jest.mock("../src/auth/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../src/api/espacios", () => ({ getEspacios: jest.fn() }));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb) => require("react").useEffect(cb, [cb]),
}));

const activo = { id: 1, nombre: "Sala A", tipo: "sala_reunion", capacidad: 6, estado: "activo" };
const inactivo = { id: 2, nombre: "Lab B", tipo: "laboratorio", capacidad: 10, estado: "inactivo" };
const nav = () => ({ navigate: jest.fn(), setOptions: jest.fn() });

describe("acciones según el rol", () => {
  test("el usuario puede reservar y no ve Editar espacio", async () => {
    useAuth.mockReturnValue({ esAdmin: false });
    await render(<EspacioDetalleScreen route={{ params: { espacio: activo } }} navigation={nav()} />);
    expect(screen.getByText("Reservar este espacio")).toBeTruthy();
    expect(screen.queryByText("Editar espacio")).toBeNull();
  });

  test("el admin ve Editar espacio y no puede reservar", async () => {
    useAuth.mockReturnValue({ esAdmin: true });
    await render(<EspacioDetalleScreen route={{ params: { espacio: activo } }} navigation={nav()} />);
    expect(screen.getByText("Editar espacio")).toBeTruthy();
    expect(screen.queryByText("Reservar este espacio")).toBeNull();
  });

  test("Editar espacio abre el formulario con el espacio", async () => {
    useAuth.mockReturnValue({ esAdmin: true });
    const navigation = nav();
    await render(<EspacioDetalleScreen route={{ params: { espacio: activo } }} navigation={navigation} />);
    await fireEvent.press(screen.getByText("Editar espacio"));
    expect(navigation.navigate).toHaveBeenCalledWith("EspacioForm", { espacio: activo });
  });

  test("el usuario no puede reservar un espacio inactivo", async () => {
    useAuth.mockReturnValue({ esAdmin: false });
    await render(<EspacioDetalleScreen route={{ params: { espacio: inactivo } }} navigation={nav()} />);
    expect(screen.getByText("Este espacio no está disponible para reservar.")).toBeTruthy();
  });

  test("el usuario ve solo espacios activos y no puede crear", async () => {
    useAuth.mockReturnValue({ esAdmin: false });
    getEspacios.mockResolvedValue([activo, inactivo]);
    await render(<EspaciosScreen navigation={nav()} />);
    expect(await screen.findByText("Sala A")).toBeTruthy();
    expect(screen.queryByText("Lab B")).toBeNull();
    expect(screen.queryByText("+ Nuevo espacio")).toBeNull();
  });

  test("el admin ve los inactivos y el botón de crear", async () => {
    useAuth.mockReturnValue({ esAdmin: true });
    getEspacios.mockResolvedValue([activo, inactivo]);
    await render(<EspaciosScreen navigation={nav()} />);
    expect(await screen.findByText("Lab B")).toBeTruthy();
    expect(screen.getByText("+ Nuevo espacio")).toBeTruthy();
  });
});
