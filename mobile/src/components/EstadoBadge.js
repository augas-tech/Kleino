import { StyleSheet, Text } from "react-native";
import { ESTADOS } from "../utils/format";

export default function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] ?? { label: estado, color: "#334155", bg: "#e2e8f0" };
  return <Text style={[s.badge, { color: e.color, backgroundColor: e.bg }]}>{e.label}</Text>;
}

const s = StyleSheet.create({
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, fontSize: 13, fontWeight: "600", overflow: "hidden" },
});
