import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — ShopNG",
  description: "Complete your purchase securely.",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/checkout");

  return (
    <CheckoutClient
      userId={session.user.id}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
    />
  );
}
