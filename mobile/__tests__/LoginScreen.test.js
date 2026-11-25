import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import LoginScreen from "../src/screens/LoginScreen";
import { useAuth } from "../src/auth/AuthContext";

jest.mock("../src/auth/AuthContext", () => ({ useAuth: jest.fn() }));

describe("pantalla de login", () => {
  test("pide correo y contraseña antes de enviar", async () => {
    const login = jest.fn();
    useAuth.mockReturnValue({ login, notice: null });
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByText("Iniciar sesión"));
    expect(screen.getByText("Ingresa tu correo y contraseña.")).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  test("llama a login con lo que escribió la persona", async () => {
    const login = jest.fn().mockResolvedValue();
    useAuth.mockReturnValue({ login, notice: null });
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText("Correo"), "alumno@kleino.cl");
    await fireEvent.changeText(screen.getByLabelText("Contraseña"), "kleino2026");
    await fireEvent.press(screen.getByText("Iniciar sesión"));
    await waitFor(() => expect(login).toHaveBeenCalledWith("alumno@kleino.cl", "kleino2026"));
  });

  test("muestra el error de la API", async () => {
    useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue(new Error("Email o contraseña incorrectos")), notice: null });
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText("Correo"), "alumno@kleino.cl");
    await fireEvent.changeText(screen.getByLabelText("Contraseña"), "mala");
    await fireEvent.press(screen.getByText("Iniciar sesión"));
    expect(await screen.findByText("Email o contraseña incorrectos")).toBeTruthy();
  });

  test("muestra el aviso de sesión expirada", async () => {
    useAuth.mockReturnValue({ login: jest.fn(), notice: "Tu sesión expiró" });
    await render(<LoginScreen />);
    expect(screen.getByText("Tu sesión expiró")).toBeTruthy();
  });
});
