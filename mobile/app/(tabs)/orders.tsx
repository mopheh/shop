import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import SignInPrompt from "../../src/components/SignInPrompt";
import { Empty, ErrorState, StatusBadge } from "../../src/components/ui";
import { useAuth } from "../../src/context/auth";
import { api, ApiError, type Order } from "../../src/lib/api";
import { formatDate, formatPrice } from "../../src/lib/format";
import { colors } from "../../src/lib/theme";

export default function OrdersScreen() {
  const { token, user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setOrders(await api.orders(token));
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut();
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load orders");
    }
  }, [token, signOut]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} size="large" />;
  if (!token) return <SignInPrompt message="Sign in to view your order history." />;
  if (error && !orders) return <ErrorState message={error} onRetry={load} />;
  if (!orders) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} size="large" />;

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={s.account}>
          <Text style={s.email} numberOfLines={1}>{user?.email || user?.name}</Text>
          <Pressable onPress={signOut} hitSlop={8}>
            <Text style={s.signOut}>Sign out</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        <Empty
          emoji="📦"
          title="No orders yet"
          subtitle="When you place an order, it will appear here."
          action={{ title: "Start shopping", onPress: () => router.navigate("/") }}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          style={s.card}
          onPress={() => router.push({ pathname: "/order/[id]", params: { id: item.id } })}
        >
          <View style={{ gap: 2 }}>
            <Text style={s.id}>Order #{item.id}</Text>
            <Text style={s.date}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Text style={s.total}>{formatPrice(item.total_kobo)}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  account: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  email: { color: colors.muted, fontSize: 13, flex: 1 },
  signOut: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 16, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  id: { fontWeight: "700", fontSize: 15, color: colors.text },
  date: { fontSize: 12, color: colors.faint },
  total: { fontWeight: "700", color: colors.text },
});
