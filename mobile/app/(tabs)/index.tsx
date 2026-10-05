import { Image } from "expo-image";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AddToCartButton from "../../src/components/AddToCartButton";
import { Empty, ErrorState } from "../../src/components/ui";
import { api, type Product } from "../../src/lib/api";
import { formatPrice } from "../../src/lib/format";
import { colors } from "../../src/lib/theme";

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts(await api.products());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !products) return <ErrorState message={error} onRetry={load} />;
  if (!products) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} size="large" />;

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      ListHeaderComponent={
        <View>
          <View style={s.hero}>
            <Text style={s.eyebrow}>PREMIUM PRODUCTS</Text>
            <Text style={s.heroTitle}>Shop the Best</Text>
            <Text style={[s.heroTitle, { color: "#4ade80" }]}>Tech & Lifestyle</Text>
            <Text style={s.heroSub}>Curated premium products delivered fast across Nigeria.</Text>
          </View>
          <Text style={s.h2}>
            All Products <Text style={s.count}>({products.length} items)</Text>
          </Text>
        </View>
      }
      ListEmptyComponent={<Empty emoji="🛍️" title="No products yet" />}
      renderItem={({ item }) => (
        <View style={s.card}>
          <Link href={{ pathname: "/product/[id]", params: { id: item.id } }} asChild>
            <Pressable>
              <Image source={{ uri: item.image_url }} style={s.image} contentFit="cover" transition={200} />
              <View style={{ padding: 16, paddingBottom: 8 }}>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
                <View style={s.row}>
                  <Text style={s.price}>{formatPrice(item.price_kobo)}</Text>
                  <Text style={s.stock}>{item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}</Text>
                </View>
              </View>
            </Pressable>
          </Link>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <AddToCartButton product={item} />
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.slate900, padding: 24, paddingVertical: 36 },
  eyebrow: { color: "#4ade80", fontWeight: "700", fontSize: 12, letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 34, fontWeight: "900", lineHeight: 40 },
  heroSub: { color: "#cbd5e1", marginTop: 12, fontSize: 15 },
  h2: { fontSize: 20, fontWeight: "700", color: colors.text, margin: 16, marginTop: 24 },
  count: { fontSize: 13, fontWeight: "400", color: colors.muted },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginHorizontal: 16, marginBottom: 16, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#f1f5f9" },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  desc: { fontSize: 13, color: colors.muted, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  price: { fontSize: 20, fontWeight: "700", color: colors.text },
  stock: { fontSize: 12, color: colors.faint },
});
