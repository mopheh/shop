/**
 * Seed the database with sample products.
 * Usage: npx tsx scripts/seed.ts
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING
 * based on product name.
 */

import { neon } from "@neondatabase/serverless";

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.error("DATABASE_URL is not set — add it to .env.local");
  process.exit(1);
}

// Strip channel_binding — not supported by the Neon HTTP driver
const cleanUrl = (() => {
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return rawUrl;
  }
})();

const sql = neon(cleanUrl);

const products = [
  {
    name: "Premium Wireless Headphones",
    description:
      "Studio-quality sound with active noise cancellation and 30-hour battery life. Foldable design with premium leather ear cups.",
    price_kobo: 4500000, // ₦45,000
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 50,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description:
      "RGB backlit mechanical keyboard with tactile switches. Full-size layout with dedicated macro keys and USB passthrough.",
    price_kobo: 2800000, // ₦28,000
    image_url:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
    stock: 30,
  },
  {
    name: "4K Webcam",
    description:
      "Ultra-sharp 4K streaming camera with auto-focus, built-in ring light, and dual noise-cancelling microphones.",
    price_kobo: 1950000, // ₦19,500
    image_url:
      "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=600&q=80",
    stock: 25,
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Lumbar-support mesh chair with adjustable armrests, seat height, and recline. Built for all-day comfort.",
    price_kobo: 8500000, // ₦85,000
    image_url:
      "https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?w=600&q=80",
    stock: 15,
  },
  {
    name: "Portable SSD 1TB",
    description:
      "Pocket-sized 1TB solid-state drive with USB-C. Transfer speeds up to 1050 MB/s. Drop-resistant casing.",
    price_kobo: 1200000, // ₦12,000
    image_url:
      "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80",
    stock: 60,
  },
  {
    name: "Smart LED Desk Lamp",
    description:
      "Touch-control desk lamp with 5 colour temperatures, wireless charging pad, and built-in USB-A port.",
    price_kobo: 650000, // ₦6,500
    image_url:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    stock: 80,
  },
];

async function main() {
  console.log("Seeding products…");
  for (const p of products) {
    await sql`
      INSERT INTO products (name, description, price_kobo, image_url, stock)
      VALUES (${p.name}, ${p.description}, ${p.price_kobo}, ${p.image_url}, ${p.stock})
      ON CONFLICT DO NOTHING
    `;
    console.log(`  ✓ ${p.name}`);
  }
  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
