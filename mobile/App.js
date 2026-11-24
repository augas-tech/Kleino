import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";

function Gate() {
  const { user, restoring, logout } = useAuth();

  if (restoring) {
    return <View style={s.center}><ActivityIndicator size="large" /></View>;
  }
  if (!user) return <LoginScreen />;

  return (
    <View style={s.center}>
      <Text style={s.text}>Hola, {user.email_address}</Text>
      <Text style={s.text}>Rol: {user.rol}</Text>
      <Pressable style={s.button} onPress={logout}><Text style={s.buttonText}>Cerrar sesión</Text></Pressable>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { fontSize: 16, marginBottom: 8 },
  button: { marginTop: 16, backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
