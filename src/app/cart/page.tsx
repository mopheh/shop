import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — ShopNG",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}
