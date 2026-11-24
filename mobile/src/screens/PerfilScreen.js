import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function PerfilScreen() {
  const { user, esAdmin, logout } = useAuth();

  const confirmarLogout = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.label}>Correo</Text>
        <Text style={s.value}>{user?.email_address}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>Rol</Text>
        <Text style={s.value}>{esAdmin ? "Administrador" : "Usuario registrado"}</Text>
      </View>
      <Pressable style={s.button} onPress={confirmarLogout} accessibilityRole="button">
        <Text style={s.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  label: { fontSize: 13, color: "#64748b", marginBottom: 2 },
  value: { fontSize: 17, color: "#0f172a", fontWeight: "600" },
  button: { backgroundColor: "#dc2626", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
