import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useCart } from "../../src/context/cart";
import { colors } from "../../src/lib/theme";

export default function TabsLayout() {
  const { totalItems } = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brandDark,
        tabBarInactiveTintColor: colors.faint,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ShopNG",
          tabBarLabel: "Shop",
          headerTitle: () => (
            <View style={s.brand}>
              <View style={s.logo}>
                <Text style={s.logoText}>S</Text>
              </View>
              <Text style={s.brandText}>ShopNG</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Your Cart",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.brand },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Your Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  brandText: { fontSize: 18, fontWeight: "700", color: colors.text },
});
