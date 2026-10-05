import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/ui";
import { colors } from "../src/lib/theme";

export default function ConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();

  return (
    <View style={s.wrap}>
      <View style={s.circle}>
        <Ionicons name="checkmark" size={56} color="#fff" />
      </View>
      <Text style={s.title}>Order Confirmed! 🎉</Text>
      {orderId ? <Text style={s.sub}>Order <Text style={{ fontWeight: "700" }}>#{orderId}</Text> has been placed.</Text> : null}
      <Text style={s.sub}>A confirmation email is on its way to you.</Text>
      <View style={s.actions}>
        {orderId ? (
          <Button
            title="View Order"
            onPress={() => {
              router.dismissAll();
              router.push({ pathname: "/order/[id]", params: { id: orderId } });
            }}
          />
        ) : null}
        <Button title="Continue Shopping" variant="outline" onPress={() => router.dismissAll()} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "900", color: colors.text, textAlign: "center" },
  sub: { color: colors.muted, textAlign: "center", fontSize: 15 },
  actions: { alignSelf: "stretch", gap: 12, marginTop: 20 },
});
