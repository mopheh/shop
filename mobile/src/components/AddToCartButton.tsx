import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/cart";
import type { Product } from "../lib/api";
import { colors } from "../lib/theme";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const soldOut = product.stock <= 0;

  return (
    <Pressable
      disabled={soldOut}
      onPress={() => {
        addItem({
          productId: product.id,
          name: product.name,
          priceKobo: product.price_kobo,
          imageUrl: product.image_url,
        });
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1500);
      }}
      style={({ pressed }) => [
        s.btn,
        added && { backgroundColor: colors.brandDark },
        soldOut && { backgroundColor: "#cbd5e1" },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Ionicons name={added ? "checkmark" : "cart-outline"} size={18} color="#fff" />
      <Text style={s.text}>{soldOut ? "Out of stock" : added ? "Added!" : "Add to Cart"}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand, paddingVertical: 13, borderRadius: 12 },
  text: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
