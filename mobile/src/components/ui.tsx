import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
}) {
  const outline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        outline ? s.btnOutline : s.btnPrimary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.text : "#fff"} />
      ) : (
        <Text style={[s.btnText, outline && { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Empty({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: { title: string; onPress: () => void };
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySub}>{subtitle}</Text> : null}
      {action ? (
        <View style={{ marginTop: 8, alignSelf: "stretch" }}>
          <Button title={action.title} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Empty emoji="⚠️" title="Something went wrong" subtitle={message} action={{ title: "Try again", onPress: onRetry }} />;
}

const badgeColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#fef9c3", fg: "#a16207" },
  confirmed: { bg: "#dcfce7", fg: "#15803d" },
  shipped: { bg: "#dbeafe", fg: "#1d4ed8" },
  delivered: { bg: "#f1f5f9", fg: "#334155" },
};

export function StatusBadge({ status }: { status: string }) {
  const c = badgeColors[status] ?? badgeColors.pending;
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: c.fg, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>{status}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: colors.brand },
  btnOutline: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, textAlign: "center" },
  emptySub: { color: colors.muted, textAlign: "center" },
});
