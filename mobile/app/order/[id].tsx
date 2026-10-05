import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Empty, ErrorState, StatusBadge } from "../../src/components/ui";
import { useAuth } from "../../src/context/auth";
import { api, ApiError, type OrderWithItems } from "../../src/lib/api";
import { formatDate, formatPrice } from "../../src/lib/format";
import { colors } from "../../src/lib/theme";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setOrder(await api.order(token, id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load order"));
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error instanceof ApiError && error.status === 404)
    return <Empty emoji="🔍" title="Order not found" action={{ title: "All orders", onPress: () => router.replace("/orders") }} />;
  if (error) return <ErrorState message={error.message} onRetry={load} />;
  if (!order) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} size="large" />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Order #{order.id}</Text>
          <Text style={s.date}>Placed on {formatDate(order.created_at, true)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Items ordered</Text>
        {order.items.map((item) => (
          <View key={item.id} style={s.item}>
            <Image source={{ uri: item.image_url }} style={s.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.itemName} numberOfLines={2}>{item.product_name}</Text>
              <Text style={s.itemSub}>{formatPrice(item.unit_price_kobo)} × {item.quantity}</Text>
            </View>
            <Text style={s.itemTotal}>{formatPrice(item.unit_price_kobo * item.quantity)}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.total}>{formatPrice(order.total_kobo)}</Text>
        </View>
      </View>

      <View style={[s.card, { padding: 16, gap: 6 }]}>
        <Text style={[s.cardTitle, { padding: 0, borderBottomWidth: 0 }]}>Shipping to</Text>
        <Text style={s.shipName}>{order.shipping_name}</Text>
        <Text style={s.ship}>{order.shipping_email}</Text>
        <Text style={s.ship}>{order.shipping_address}</Text>
        <Text style={s.ship}>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  date: { fontSize: 12, color: colors.faint, marginTop: 2 },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  cardTitle: { fontWeight: "600", fontSize: 15, color: colors.text, padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#f1f5f9" },
  itemName: { fontWeight: "500", fontSize: 14, color: colors.text },
  itemSub: { fontSize: 12, color: colors.faint, marginTop: 2 },
  itemTotal: { fontWeight: "700", fontSize: 14, color: colors.text },
  totalRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: colors.bg },
  totalLabel: { fontWeight: "700", color: colors.text },
  total: { fontWeight: "700", fontSize: 18, color: colors.brandDark },
  shipName: { fontWeight: "700", color: colors.text },
  ship: { fontSize: 14, color: colors.muted },
});
