import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../auth/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import EspaciosScreen from "../screens/EspaciosScreen";
import EspacioDetalleScreen from "../screens/EspacioDetalleScreen";
import ReservaFormScreen from "../screens/ReservaFormScreen";
import MisReservasScreen from "../screens/MisReservasScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { esAdmin } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIconStyle: { display: "none" },
        tabBarLabelStyle: { fontSize: 15, fontWeight: "600" },
        tabBarActiveTintColor: "#2563eb",
      }}
    >
      <Tab.Screen name="Espacios" component={EspaciosScreen} />
      <Tab.Screen
        name="MisReservas" component={MisReservasScreen}
        options={{ title: esAdmin ? "Reservas" : "Mis reservas" }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="EspacioDetalle" component={EspacioDetalleScreen} options={{ title: "Detalle" }} />
            <Stack.Screen name="ReservaForm" component={ReservaFormScreen} options={{ title: "Reserva" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
