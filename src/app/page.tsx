import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

export const metadata: Metadata = {
  title: "ShopNG — Premium Online Store",
  description:
    "Discover premium tech and lifestyle products with fast delivery across Nigeria.",
};

// Revalidate every 60 seconds so new products appear without a full redeploy
export const revalidate = 60;

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <main className="flex-1">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-400 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="text-green-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Premium Products
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Shop the Best<br />
            <span className="text-green-400">Tech & Lifestyle</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mb-8">
            Curated premium products delivered fast across Nigeria. No compromises on quality.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-900/30"
          >
            Browse products ↓
          </a>
        </div>
      </section>

      {/* Product grid */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        aria-label="Products"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          All Products
          <span className="ml-3 text-sm font-normal text-slate-500">
            ({products.length} items)
          </span>
        </h2>

        {products.length === 0 ? (
          <p className="text-slate-500 text-center py-24">
            No products yet — run <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">npm run db:seed</code> to populate.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {products.map((product) => (
              <li key={product.id}>
                <article className="group flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Product image */}
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`View details for ${product.name}`}
                    className="block relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800"
                    tabIndex={0}
                  >
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Product info */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex-1">
                      <Link href={`/products/${product.id}`} tabIndex={-1} aria-hidden="true">
                        <h3 className="font-semibold text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(product.price_kobo)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    <AddToCartButton
                      productId={product.id}
                      name={product.name}
                      priceKobo={product.price_kobo}
                      imageUrl={product.image_url}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
