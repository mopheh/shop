import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import SignInPrompt from "../src/components/SignInPrompt";
import { Button, Empty } from "../src/components/ui";
import { useAuth } from "../src/context/auth";
import { useCart } from "../src/context/cart";
import { api, ApiError } from "../src/lib/api";
import { formatPrice } from "../src/lib/format";
import { colors } from "../src/lib/theme";

type Form = {
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
};

// Mirrors CheckoutSchema in the web app's src/lib/orders.ts.
function validate(f: Form): string | null {
  if (f.shippingName.trim().length < 2) return "Please enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(f.shippingEmail.trim())) return "Please enter a valid email.";
  if (f.shippingAddress.trim().length < 5) return "Please enter your street address.";
  if (f.shippingCity.trim().length < 2) return "Please enter your city.";
  if (f.shippingState.trim().length < 2) return "Please enter your state.";
  if (f.shippingZip.trim().length < 3) return "Please enter your postal code.";
  return null;
}

export default function CheckoutScreen() {
  const { token, user, loading, signOut } = useAuth();
  const { items, totalKobo, clearCart } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    shippingName: user?.name ?? "",
    shippingEmail: user?.email ?? "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
  });

  if (loading) return null;
  if (!token) return <SignInPrompt message="Sign in to place your order." />;
  if (items.length === 0)
    return <Empty emoji="🛒" title="Your cart is empty" action={{ title: "Browse products", onPress: () => router.replace("/") }} />;

  const set = (k: keyof Form) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError(null);
  };

  async function submit() {
    const problem = validate(form);
    if (problem || !token) return setError(problem);
    setBusy(true);
    try {
      const { orderId } = await api.placeOrder(token, {
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      clearCart();
      router.replace({ pathname: "/confirmation", params: { orderId } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut();
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.h2}>Shipping Information</Text>
          <Field label="Full name" value={form.shippingName} onChangeText={set("shippingName")} autoComplete="name" />
          <Field label="Email" value={form.shippingEmail} onChangeText={set("shippingEmail")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="Street address" value={form.shippingAddress} onChangeText={set("shippingAddress")} placeholder="123 Lagos Street" autoComplete="street-address" />
          <Field label="City" value={form.shippingCity} onChangeText={set("shippingCity")} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field label="State" value={form.shippingState} onChangeText={set("shippingState")} placeholder="Lagos" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Postal code" value={form.shippingZip} onChangeText={set("shippingZip")} placeholder="100001" keyboardType="number-pad" />
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.h2}>Order Summary</Text>
          {items.map((i) => (
            <View key={i.productId} style={s.line}>
              <Text style={s.lineName} numberOfLines={1}>{i.name} × {i.quantity}</Text>
              <Text style={s.lineTotal}>{formatPrice(i.priceKobo * i.quantity)}</Text>
            </View>
          ))}
          <View style={s.line}>
            <Text style={s.muted}>Shipping</Text>
            <Text style={{ color: colors.brandDark, fontWeight: "500" }}>Free</Text>
          </View>
          <View style={[s.line, s.totalRow]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.total}>{formatPrice(totalKobo)}</Text>
          </View>
        </View>

        {error ? (
          <View style={s.error}>
            <Text style={{ color: "#b91c1c" }}>{error}</Text>
          </View>
        ) : null}

        <Button title={busy ? "Placing order…" : `Place Order · ${formatPrice(totalKobo)}`} onPress={submit} loading={busy} />
        <Text style={s.note}>🔒 Secure order — prices verified server-side</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...rest }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>
        {label} <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput style={s.input} placeholderTextColor={colors.faint} {...rest} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14 },
  h2: { fontWeight: "700", fontSize: 17, color: colors.text },
  label: { fontSize: 13, fontWeight: "500", color: "#334155" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text, backgroundColor: colors.card },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  lineName: { flex: 1, color: colors.muted, fontSize: 14 },
  lineTotal: { fontWeight: "500", fontSize: 14, color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  totalLabel: { fontWeight: "700", color: colors.text },
  total: { fontWeight: "700", fontSize: 20, color: colors.brandDark },
  error: { backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 12, padding: 12 },
  note: { fontSize: 12, color: colors.faint, textAlign: "center" },
});
