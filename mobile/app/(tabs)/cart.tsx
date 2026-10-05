import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Empty } from "../../src/components/ui";
import { useCart } from "../../src/context/cart";
import { formatPrice } from "../../src/lib/format";
import { colors } from "../../src/lib/theme";

export default function CartScreen() {
  const { items, totalItems, totalKobo, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0)
    return (
      <Empty
        emoji="🛒"
        title="Your cart is empty"
        subtitle="Browse our products and add something you love."
        action={{ title: "Browse products", onPress: () => router.navigate("/") }}
      />
    );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.productId)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View style={s.header}>
            <Text style={s.count}>{totalItems} item{totalItems !== 1 ? "s" : ""}</Text>
            <Pressable onPress={clearCart} hitSlop={8}>
              <Text style={s.clear}>Clear all</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.item}>
            <Pressable onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.productId } })}>
              <Image source={{ uri: item.imageUrl }} style={s.thumb} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <Pressable onPress={() => removeItem(item.productId)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.faint} />
                </Pressable>
              </View>
              <View style={s.row}>
                <View style={s.stepper}>
                  <Pressable
                    style={s.stepBtn}
                    disabled={item.quantity <= 1}
                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={item.quantity <= 1 ? colors.border : colors.text} />
                  </Pressable>
                  <Text style={s.qty}>{item.quantity}</Text>
                  <Pressable style={s.stepBtn} onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                    <Ionicons name="add" size={16} color={colors.text} />
                  </Pressable>
                </View>
                <Text style={s.lineTotal}>{formatPrice(item.priceKobo * item.quantity)}</Text>
              </View>
            </View>
          </View>
        )}
      />
      <View style={s.footer}>
        <View style={s.row}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.total}>{formatPrice(totalKobo)}</Text>
        </View>
        <Text style={s.ship}>Shipping: Free</Text>
        <Button title="Proceed to Checkout" onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  count: { color: colors.muted, fontSize: 13 },
  clear: { color: colors.faint, fontSize: 13 },
  item: { flexDirection: "row", gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  thumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f1f5f9" },
  name: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  stepBtn: { padding: 7 },
  qty: { minWidth: 28, textAlign: "center", fontWeight: "500" },
  lineTotal: { fontWeight: "700", color: colors.text },
  footer: { padding: 16, gap: 8, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontWeight: "700", fontSize: 16, color: colors.text },
  total: { fontWeight: "700", fontSize: 22, color: colors.brandDark },
  ship: { color: colors.muted, fontSize: 12, marginBottom: 4 },
});
