import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "./src/auth/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

const DEMO = process.env.EXPO_PUBLIC_DEMO === "true";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {DEMO && (
          <SafeAreaView edges={["top"]} style={s.demo}>
            <Text style={s.demoText}>MODO DEMO · datos de ejemplo, sin API</Text>
          </SafeAreaView>
        )}
        <AppNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  demo: { backgroundColor: "#fef3c7" },
  demoText: { textAlign: "center", color: "#92400e", fontWeight: "700", paddingVertical: 4 },
});
