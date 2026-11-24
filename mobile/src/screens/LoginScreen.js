import { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  StyleSheet, Text, TextInput,
} from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function LoginScreen() {
  const { login, notice } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={s.title}>Kleino</Text>
      <Text style={s.subtitle}>Reserva de espacios compartidos</Text>

      {notice && <Text style={s.notice}>{notice}</Text>}

      <TextInput
        style={s.input} placeholder="Correo" value={email} onChangeText={setEmail}
        autoCapitalize="none" autoComplete="email" keyboardType="email-address"
        accessibilityLabel="Correo"
      />
      <TextInput
        style={s.input} placeholder="Contraseña" value={password} onChangeText={setPassword}
        secureTextEntry accessibilityLabel="Contraseña" onSubmitEditing={onSubmit}
      />

      {error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}

      <Pressable
        style={[s.button, loading && s.buttonDisabled]} onPress={onSubmit}
        disabled={loading} accessibilityRole="button"
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Iniciar sesión</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", color: "#0f172a" },
  subtitle: { fontSize: 15, textAlign: "center", color: "#475569", marginBottom: 32 },
  notice: { backgroundColor: "#fef3c7", color: "#92400e", padding: 12, borderRadius: 8, marginBottom: 16 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  error: { color: "#b91c1c", marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
