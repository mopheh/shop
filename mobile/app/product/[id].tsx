import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import AddToCartButton from "../../src/components/AddToCartButton";
import { Empty, ErrorState } from "../../src/components/ui";
import { api, ApiError, type Product } from "../../src/lib/api";
import { formatPrice } from "../../src/lib/format";
import { colors } from "../../src/lib/theme";

const BADGES = ["🔒 Secure checkout", "🚚 Fast Nigeria delivery", "↩️ 30-day returns", "💬 24/7 support"];

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const load = useCallback(async () => {
    try {
      setProduct(await api.product(id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load product"));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error instanceof ApiError && error.status === 404)
    return <Empty emoji="🔍" title="Product not found" action={{ title: "Back to shop", onPress: () => router.replace("/") }} />;
  if (error) return <ErrorState message={error.message} onRetry={load} />;
  if (!product) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} size="large" />;

  const inStock = product.stock > 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <Stack.Screen options={{ title: product.name }} />
      <Image source={{ uri: product.image_url }} style={s.image} contentFit="cover" transition={200} />
      <View style={s.body}>
        <View style={[s.pill, { backgroundColor: inStock ? colors.brandLight : colors.dangerLight }]}>
          <Text style={[s.pillText, { color: inStock ? "#15803d" : "#b91c1c" }]}>
            {inStock ? `✓ In stock (${product.stock} available)` : "Out of stock"}
          </Text>
        </View>
        <Text style={s.title}>{product.name}</Text>
        <Text style={s.price}>{formatPrice(product.price_kobo)}</Text>
        <Text style={s.desc}>{product.description}</Text>
        <View style={s.hr} />
        <AddToCartButton product={product} />
        <View style={s.badges}>
          {BADGES.map((b) => (
            <Text key={b} style={s.badge}>{b}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f1f5f9" },
  body: { padding: 20, gap: 14 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "900", color: colors.text },
  price: { fontSize: 26, fontWeight: "700", color: colors.brandDark },
  desc: { fontSize: 15, lineHeight: 22, color: colors.muted },
  hr: { height: 1, backgroundColor: colors.border },
  badges: { flexDirection: "row", flexWrap: "wrap", rowGap: 10 },
  badge: { width: "50%", fontSize: 13, color: colors.muted },
});
