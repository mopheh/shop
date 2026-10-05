import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/auth";
import { colors } from "../lib/theme";
import { Button } from "./ui";

export default function SignInPrompt({ message }: { message: string }) {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onPress() {
    setBusy(true);
    try {
      await signIn();
    } catch {
      Alert.alert("Sign in failed", "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.wrap}>
      <View style={s.logo}>
        <Text style={s.logoText}>S</Text>
      </View>
      <Text style={s.title}>Sign in to ShopNG</Text>
      <Text style={s.sub}>{message}</Text>
      <View style={{ alignSelf: "stretch", marginTop: 8 }}>
        <Button title="Continue with Google" onPress={onPress} loading={busy} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 8 },
  sub: { color: colors.muted, textAlign: "center" },
});
