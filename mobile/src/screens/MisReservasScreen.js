import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { cancelarReserva, getReservas } from "../api/reservas";
import { getEspacios } from "../api/espacios";
import { useAuth } from "../auth/AuthContext";
import EstadoBadge from "../components/EstadoBadge";
import { fechaLarga, hhmm } from "../utils/format";

const CANCELABLES = ["pendiente", "aprobada"];

export default function MisReservasScreen({ navigation }) {
  const { esAdmin } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [rs, es] = await Promise.all([getReservas(), getEspacios()]);
      setReservas(rs ?? []);
      setEspacios(Object.fromEntries((es ?? []).map((e) => [e.id, e])));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmarCancelacion = (reserva) => {
    Alert.alert("Cancelar reserva", "¿Seguro que quieres cancelar esta reserva?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelarReserva(reserva.id);
            load();
          } catch (e) {
            Alert.alert("No se pudo cancelar", e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.container}>
      {error && (
        <Pressable onPress={load}><Text style={s.error}>{error} Toca para reintentar.</Text></Pressable>
      )}
      <FlatList
        data={reservas}
        keyExtractor={(r) => String(r.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <Text style={s.empty}>{esAdmin ? "No hay reservas en tus espacios." : "Todavía no tienes reservas."}</Text>
        }
        renderItem={({ item }) => {
          const espacio = espacios[item.espacio_id] ?? { id: item.espacio_id, nombre: `Espacio #${item.espacio_id}` };
          const editable = !esAdmin && item.estado === "pendiente";
          const cancelable = CANCELABLES.includes(item.estado);
          return (
            <View style={s.card}>
              <View style={s.header}>
                <Text style={s.nombre}>{espacio.nombre}</Text>
                <EstadoBadge estado={item.estado} />
              </View>
              <Text style={s.meta}>{fechaLarga(item.fecha)}</Text>
              <Text style={s.meta}>{hhmm(item.hora_inicio)} – {hhmm(item.hora_fin)}</Text>
              {(editable || cancelable) && (
                <View style={s.actions}>
                  {editable && (
                    <Pressable
                      style={[s.action, s.secondary]} accessibilityRole="button"
                      onPress={() => navigation.navigate("ReservaForm", { espacio, reserva: item })}
                    >
                      <Text style={s.secondaryText}>Editar</Text>
                    </Pressable>
                  )}
                  {cancelable && (
                    <Pressable
                      style={[s.action, s.danger]} accessibilityRole="button"
                      onPress={() => confirmarCancelacion(item)}
                    >
                      <Text style={s.dangerText}>Cancelar</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 },
  nombre: { fontSize: 17, fontWeight: "700", color: "#0f172a", flexShrink: 1 },
  meta: { fontSize: 14, color: "#475569" },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  action: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  secondary: { borderColor: "#2563eb" },
  secondaryText: { color: "#2563eb", fontWeight: "600" },
  danger: { borderColor: "#dc2626" },
  dangerText: { color: "#dc2626", fontWeight: "600" },
  error: { color: "#b91c1c", marginBottom: 12 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32 },
});
