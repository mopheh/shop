/**
 * Order business logic — createOrder lives here, not in route handlers.
 * Recomputes totals from DB prices; never trusts client-supplied amounts.
 */

import { z } from "zod";
import { createOrder as dbCreateOrder, getProductsByIds, Order } from "./db";
import { sendOrderConfirmation } from "./email";

// ─── Zod schema for checkout form input ──────────────────────────────────────

export const CheckoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingEmail: z.string().email(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingState: z.string().min(2),
  shippingZip: z.string().min(3),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

// ─── Place order ─────────────────────────────────────────────────────────────

export async function placeOrder(
  userId: string,
  raw: unknown
): Promise<Order> {
  // 1. Validate form input
  const input = CheckoutSchema.parse(raw);

  // 2. Re-fetch prices from DB — never trust client amounts
  const productIds = input.items.map((i) => i.productId);
  const products = await getProductsByIds(productIds);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const resolvedItems = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceKobo: product.price_kobo,
      name: product.name,
    };
  });

  // 3. Compute total server-side
  const totalKobo = resolvedItems.reduce(
    (sum, item) => sum + item.unitPriceKobo * item.quantity,
    0
  );

  // 4. Persist order + items in one DB transaction
  const order = await dbCreateOrder({
    userId,
    totalKobo,
    shippingName: input.shippingName,
    shippingEmail: input.shippingEmail,
    shippingAddress: input.shippingAddress,
    shippingCity: input.shippingCity,
    shippingState: input.shippingState,
    shippingZip: input.shippingZip,
    items: resolvedItems,
  });

  // 5. Send confirmation email — failure must NOT roll back the order
  try {
    await sendOrderConfirmation({
      to: input.shippingEmail,
      toName: input.shippingName,
      orderId: order.id,
      items: resolvedItems,
      totalKobo,
      shippingAddress: input.shippingAddress,
      shippingCity: input.shippingCity,
      shippingState: input.shippingState,
      shippingZip: input.shippingZip,
    });
  } catch (err) {
    console.error("[email] Failed to send order confirmation:", err);
  }

  return order;
}
