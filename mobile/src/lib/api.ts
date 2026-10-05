import Constants from "expo-constants";

export interface Product {
  id: number;
  name: string;
  description: string;
  price_kobo: number;
  image_url: string;
  stock: number;
}

export interface Order {
  id: number;
  status: string;
  total_kobo: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: {
    id: number;
    product_id: number;
    quantity: number;
    unit_price_kobo: number;
    product_name: string;
    image_url: string;
  }[];
}

export interface CartLine {
  productId: number;
  name: string;
  priceKobo: number;
  imageUrl: string;
  quantity: number;
}

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, token?: string | null, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "Something went wrong", res.status);
  return body as T;
}

export const api = {
  products: () => request<{ products: Product[] }>("/api/products").then((r) => r.products),
  product: (id: number | string) =>
    request<{ product: Product }>(`/api/products/${id}`).then((r) => r.product),
  orders: (token: string) =>
    request<{ orders: Order[] }>("/api/orders", token).then((r) => r.orders),
  order: (token: string, id: number | string) =>
    request<{ order: OrderWithItems }>(`/api/orders/${id}`, token).then((r) => r.order),
  cart: (token: string) => request<{ items: CartLine[] }>("/api/cart", token).then((r) => r.items),
  saveCart: (token: string, items: { productId: number; quantity: number }[]) =>
    request<{ items: CartLine[] }>("/api/cart", token, {
      method: "PUT",
      body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
    }),
  placeOrder: (token: string, payload: unknown) =>
    request<{ orderId: number }>("/api/orders", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
