import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, replaceCart } from "@/lib/db";
import { getUserId } from "@/lib/mobile-auth";

export const runtime = "nodejs";

const CartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(999),
      })
    )
    .max(100),
});

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getCart(userId) });
}

export async function PUT(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CartSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart" }, { status: 422 });

  // De-duplicate by product id (last one wins) so the insert can't hit the PK twice.
  const byId = new Map(parsed.data.items.map((i) => [i.productId, i]));
  await replaceCart(userId, [...byId.values()]);
  return NextResponse.json({ items: await getCart(userId) });
}
