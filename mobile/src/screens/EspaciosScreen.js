import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getEspacios } from "../api/espacios";
import { useAuth } from "../auth/AuthContext";
import { tipoLabel } from "../utils/format";

export default function EspaciosScreen({ navigation }) {
  const { esAdmin } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = (await getEspacios()) ?? [];
      setEspacios(esAdmin ? data : data.filter((e) => e.estado === "activo"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [esAdmin]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return espacios;
    return espacios.filter((e) =>
      [e.nombre, e.tipo, e.ubicacion].some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [espacios, query]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.container}>
      {esAdmin && (
        <Pressable style={s.nuevo} accessibilityRole="button" onPress={() => navigation.navigate("EspacioForm")}>
          <Text style={s.nuevoText}>+ Nuevo espacio</Text>
        </Pressable>
      )}
      <TextInput
        style={s.search} placeholder="Buscar por nombre, tipo o ubicación"
        value={query} onChangeText={setQuery} accessibilityLabel="Buscar espacios"
      />
      {error && (
        <Pressable onPress={load}><Text style={s.error}>{error} Toca para reintentar.</Text></Pressable>
      )}
      <FlatList
        data={filtrados}
        keyExtractor={(e) => String(e.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={s.empty}>No hay espacios disponibles.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={s.card} accessibilityRole="button"
            onPress={() => navigation.navigate("EspacioDetalle", { espacio: item })}
          >
            <Text style={s.nombre}>{item.nombre}</Text>
            <Text style={s.meta}>
              {tipoLabel(item.tipo)}{item.capacidad ? ` · ${item.capacidad} personas` : ""}
            </Text>
            {item.ubicacion ? <Text style={s.meta}>{item.ubicacion}</Text> : null}
            {item.estado !== "activo" && <Text style={s.inactivo}>Inactivo</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  search: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  nombre: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  meta: { fontSize: 14, color: "#475569" },
  inactivo: { marginTop: 6, color: "#b91c1c", fontWeight: "600" },
  error: { color: "#b91c1c", marginBottom: 12 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32 },
  nuevo: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  nuevoText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
