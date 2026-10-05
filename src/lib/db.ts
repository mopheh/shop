import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// The Neon HTTP driver doesn't support channel_binding — strip it if present.
function buildConnectionUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw;
  }
}

const sql = neon(buildConnectionUrl(process.env.DATABASE_URL));


// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  price_kobo: number;
  image_url: string;
  stock: number;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: Date;
}

export interface Order {
  id: number;
  user_id: string;
  status: string;
  total_kobo: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_kobo: number;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product_name: string; image_url: string })[];
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products ORDER BY id`;
  return rows as Product[];
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Product) ?? null;
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const rows = await sql`SELECT * FROM products WHERE id = ANY(${ids})`;
  return rows as Product[];
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<User> {
  const rows = await sql`
    INSERT INTO users (id, email, name, image)
    VALUES (${user.id}, ${user.email}, ${user.name ?? null}, ${user.image ?? null})
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          name  = EXCLUDED.name,
          image = EXCLUDED.image
    RETURNING *
  `;
  return rows[0] as User;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  userId: string;
  totalKobo: number;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  items: Array<{ productId: number; quantity: number; unitPriceKobo: number }>;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Insert order first to get its ID
  const orderRows = await sql`
    INSERT INTO orders
      (user_id, total_kobo, shipping_name, shipping_email,
       shipping_address, shipping_city, shipping_state, shipping_zip)
    VALUES
      (${input.userId}, ${input.totalKobo}, ${input.shippingName},
       ${input.shippingEmail}, ${input.shippingAddress}, ${input.shippingCity},
       ${input.shippingState}, ${input.shippingZip})
    RETURNING *
  `;
  const order = orderRows[0] as Order;

  // Insert all order items
  for (const item of input.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_kobo)
      VALUES (${order.id}, ${item.productId}, ${item.quantity}, ${item.unitPriceKobo})
    `;
  }

  return order;
}


export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const rows = await sql`
    SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return rows as Order[];
}

export async function getOrderWithItems(
  orderId: number,
  userId: string
): Promise<OrderWithItems | null> {
  const orderRows = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND user_id = ${userId} LIMIT 1
  `;
  if (!orderRows[0]) return null;
  const order = orderRows[0] as Order;

  const itemRows = await sql`
    SELECT oi.*, p.name AS product_name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ${orderId}
  `;

  return { ...order, items: itemRows as (OrderItem & { product_name: string; image_url: string })[] };
}

// ─── Cart (synced across web + mobile) ───────────────────────────────────────

export interface CartLine {
  productId: number;
  name: string;
  priceKobo: number;
  imageUrl: string;
  quantity: number;
}

export async function getCart(userId: string): Promise<CartLine[]> {
  const rows = await sql`
    SELECT ci.product_id, ci.quantity, p.name, p.price_kobo, p.image_url
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ${userId}
    ORDER BY ci.updated_at, ci.product_id
  `;
  return rows.map((r) => ({
    productId: r.product_id as number,
    name: r.name as string,
    priceKobo: r.price_kobo as number,
    imageUrl: r.image_url as string,
    quantity: r.quantity as number,
  }));
}

/** Replaces the user's whole cart. Unknown product ids are ignored. */
export async function replaceCart(
  userId: string,
  items: Array<{ productId: number; quantity: number }>
): Promise<void> {
  const ids = items.map((i) => i.productId);
  const qty = items.map((i) => i.quantity);
  await sql.transaction([
    sql`DELETE FROM cart_items WHERE user_id = ${userId}`,
    sql`
      INSERT INTO cart_items (user_id, product_id, quantity)
      SELECT ${userId}, p.id, i.quantity
      FROM unnest(${ids}::int[], ${qty}::int[]) AS i(product_id, quantity)
      JOIN products p ON p.id = i.product_id
    `,
  ]);
}
