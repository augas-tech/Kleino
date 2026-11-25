import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fechaLarga, toHHMM, toISODate } from "../utils/format";

export default function PickerField({ label, value, mode, onChange, minimumDate }) {
  const [show, setShow] = useState(false);
  const text = mode === "date" ? fechaLarga(toISODate(value)) : toHHMM(value);

  if (Platform.OS === "ios") {
    return (
      <View style={s.rowIos}>
        <Text style={s.label}>{label}</Text>
        <DateTimePicker
          value={value} mode={mode} display="compact" is24Hour locale="es-CL"
          minimumDate={minimumDate} onChange={(_, d) => d && onChange(d)}
        />
      </View>
    );
  }

  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.input} onPress={() => setShow(true)} accessibilityRole="button" accessibilityLabel={`${label}: ${text}`}>
        <Text style={s.value}>{text}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={value} mode={mode} is24Hour minimumDate={minimumDate}
          onChange={(event, d) => {
            setShow(false);
            if (event.type === "set" && d) onChange(d);
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: 16 },
  rowIos: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 14 },
  value: { fontSize: 16, color: "#0f172a" },
});
