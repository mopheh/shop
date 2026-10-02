import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { placeOrder } from "@/lib/orders";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Require authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Place order — validation, price recomputation, DB write, email
  try {
    const order = await placeOrder(session.user.id, body);
    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: err.flatten() },
        { status: 422 }
      );
    }
    console.error("[api/orders] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
