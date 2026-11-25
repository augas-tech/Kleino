import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import PickerField from "../components/PickerField";
import { createReserva, updateReserva } from "../api/reservas";
import { dateWithTime, fechaLarga, parseISODate, toHHMM, toISODate } from "../utils/format";

const inicioPorDefecto = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
};

export default function ReservaFormScreen({ route, navigation }) {
  const { espacio, reserva } = route.params;
  const editando = Boolean(reserva);

  const [fecha, setFecha] = useState(() => (editando ? parseISODate(reserva.fecha) : new Date()));
  const [inicio, setInicio] = useState(() => (editando ? dateWithTime(reserva.hora_inicio) : inicioPorDefecto()));
  const [fin, setFin] = useState(() =>
    editando ? dateWithTime(reserva.hora_fin) : new Date(inicioPorDefecto().getTime() + 60 * 60 * 1000)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? "Editar reserva" : "Nueva reserva" });
  }, [navigation, editando]);

  const onSubmit = async () => {
    if (toHHMM(fin) <= toHHMM(inicio)) {
      setError("La hora de término debe ser posterior a la de inicio.");
      return;
    }
    const data = {
      espacio_id: espacio.id,
      fecha: toISODate(fecha),
      hora_inicio: toHHMM(inicio),
      hora_fin: toHHMM(fin),
    };
    setSaving(true);
    setError(null);
    try {
      if (editando) {
        await updateReserva(reserva.id, data);
        Alert.alert("Reserva actualizada", "Guardamos los cambios.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await createReserva(data);
        Alert.alert(
          "¡Reserva creada!",
          `${espacio.nombre}\n${fechaLarga(data.fecha)}, ${data.hora_inicio}–${data.hora_fin}\nEstado: pendiente.`,
          [{ text: "Ver mis reservas", onPress: () => navigation.navigate("Tabs", { screen: "MisReservas" }) }]
        );
      }
    } catch (e) {
      setError(e.status === 422 ? `No se pudo guardar: ${e.message}` : e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.espacio}>{espacio.nombre}</Text>

      <PickerField label="Fecha" mode="date" value={fecha} onChange={setFecha} minimumDate={new Date()} />
      <PickerField label="Hora de inicio" mode="time" value={inicio} onChange={setInicio} />
      <PickerField label="Hora de término" mode="time" value={fin} onChange={setFin} />

      {error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}

      <Pressable
        style={[s.button, saving && s.disabled]} onPress={onSubmit}
        disabled={saving} accessibilityRole="button"
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.buttonText}>{editando ? "Guardar cambios" : "Confirmar reserva"}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  espacio: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 20 },
  error: { color: "#b91c1c", backgroundColor: "#fee2e2", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
