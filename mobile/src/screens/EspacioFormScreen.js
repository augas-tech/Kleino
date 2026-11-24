import { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { createEspacio, updateEspacio } from "../api/espacios";
import { getSedes } from "../api/sedes";
import { hhmm } from "../utils/format";
import { validarEspacio } from "../utils/validaciones";

function Campo({ label, ...props }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

export default function EspacioFormScreen({ route, navigation }) {
  const espacio = route.params?.espacio;
  const editando = Boolean(espacio);
  const [form, setForm] = useState({
    nombre: espacio?.nombre ?? "",
    tipo: espacio?.tipo ?? "",
    capacidad: espacio?.capacidad ? String(espacio.capacidad) : "",
    ubicacion: espacio?.ubicacion ?? "",
    descripcion: espacio?.descripcion ?? "",
    hora_apertura: hhmm(espacio?.hora_apertura),
    hora_cierre: hhmm(espacio?.hora_cierre),
    sede_id: espacio?.sede_id ?? null,
    activo: espacio ? espacio.estado === "activo" : true,
  });
  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? "Editar espacio" : "Nuevo espacio" });
  }, [navigation, editando]);

  useEffect(() => {
    getSedes()
      .then((data) => {
        const lista = data ?? [];
        setSedes(lista);
        if (!espacio && lista.length === 1) setForm((f) => ({ ...f, sede_id: lista[0].id }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSedes(false));
  }, []);

  const onSubmit = async () => {
    const errores = validarEspacio(form);
    if (errores.length) {
      setError(errores.join("\n"));
      return;
    }
    const data = {
      nombre: form.nombre.trim(),
      tipo: form.tipo.trim() || null,
      capacidad: Number(form.capacidad),
      ubicacion: form.ubicacion.trim() || null,
      descripcion: form.descripcion.trim() || null,
      hora_apertura: form.hora_apertura.trim() || null,
      hora_cierre: form.hora_cierre.trim() || null,
      estado: form.activo ? "activo" : "inactivo",
      sede_id: form.sede_id,
    };
    setSaving(true);
    setError(null);
    try {
      if (editando) await updateEspacio(espacio.id, data);
      else await createEspacio(data);
      Alert.alert(editando ? "Espacio actualizado" : "Espacio creado", data.nombre, [
        { text: "OK", onPress: () => navigation.popToTop() },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Campo label="Nombre" value={form.nombre} onChangeText={set("nombre")} />
      <Campo label="Tipo" value={form.tipo} onChangeText={set("tipo")} placeholder="sala_reunion, laboratorio, cancha…" autoCapitalize="none" />
      <Campo label="Capacidad" value={form.capacidad} onChangeText={set("capacidad")} keyboardType="number-pad" />
      <Campo label="Ubicación" value={form.ubicacion} onChangeText={set("ubicacion")} />
      <Campo label="Descripción" value={form.descripcion} onChangeText={set("descripcion")} multiline />
      <Campo label="Hora de apertura" value={form.hora_apertura} onChangeText={set("hora_apertura")} placeholder="09:00" />
      <Campo label="Hora de cierre" value={form.hora_cierre} onChangeText={set("hora_cierre")} placeholder="18:00" />

      <Text style={s.label}>Sede</Text>
      {loadingSedes ? (
        <ActivityIndicator style={{ marginBottom: 16 }} />
      ) : sedes.length === 0 ? (
        <Text style={s.aviso}>No tienes sedes. Crea una desde la web primero.</Text>
      ) : (
        <View style={s.chips}>
          {sedes.map((sd) => {
            const sel = sd.id === form.sede_id;
            return (
              <Pressable
                key={sd.id} style={[s.chip, sel && s.chipSel]} onPress={() => set("sede_id")(sd.id)}
                accessibilityRole="button" accessibilityState={{ selected: sel }}
              >
                <Text style={[s.chipText, sel && s.chipTextSel]}>{sd.nombre}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={s.switchRow}>
        <Text style={s.label}>Disponible para reservar</Text>
        <Switch value={form.activo} onValueChange={set("activo")} accessibilityLabel="Disponible para reservar" />
      </View>

      {error && <Text style={s.error} accessibilityRole="alert">{error}</Text>}

      <Pressable style={[s.button, saving && s.disabled]} onPress={onSubmit} disabled={saving} accessibilityRole="button">
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{editando ? "Guardar cambios" : "Crear espacio"}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, fontSize: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#fff" },
  chipSel: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { color: "#334155" },
  chipTextSel: { color: "#fff", fontWeight: "600" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  aviso: { color: "#b45309", marginBottom: 16 },
  error: { color: "#b91c1c", backgroundColor: "#fee2e2", padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, alignItems: "center" },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
