import { useLayoutEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { hhmm, tipoLabel } from "../utils/format";

function Fila({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <View style={s.fila}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export default function EspacioDetalleScreen({ route, navigation }) {
  const { espacio } = route.params;
  const { esAdmin } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({ title: espacio.nombre });
  }, [navigation, espacio.nombre]);

  const horario = espacio.hora_apertura && espacio.hora_cierre
    ? `${hhmm(espacio.hora_apertura)} – ${hhmm(espacio.hora_cierre)}`
    : null;
  const activo = espacio.estado === "activo";

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.titulo}>{espacio.nombre}</Text>
      <Fila label="Tipo" value={tipoLabel(espacio.tipo)} />
      <Fila label="Capacidad" value={espacio.capacidad ? `${espacio.capacidad} personas` : null} />
      <Fila label="Ubicación" value={espacio.ubicacion} />
      <Fila label="Horario" value={horario} />
      <Fila label="Estado" value={activo ? "Activo" : "Inactivo"} />
      <Fila label="Descripción" value={espacio.descripcion} />

      {!esAdmin && activo && (
        <Pressable
          style={s.button} accessibilityRole="button"
          onPress={() => navigation.navigate("ReservaForm", { espacio })}
        >
          <Text style={s.buttonText}>Reservar este espacio</Text>
        </Pressable>
      )}
      {esAdmin && (
        <Pressable
          style={s.button} accessibilityRole="button"
          onPress={() => navigation.navigate("EspacioForm", { espacio })}
        >
          <Text style={s.buttonText}>Editar espacio</Text>
        </Pressable>
      )}
      {!esAdmin && !activo && <Text style={s.aviso}>Este espacio no está disponible para reservar.</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  titulo: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  fila: { backgroundColor: "#fff", borderRadius: 8, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  label: { fontSize: 13, color: "#64748b", marginBottom: 2 },
  value: { fontSize: 16, color: "#0f172a" },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  aviso: { marginTop: 16, color: "#b91c1c", textAlign: "center" },
});
