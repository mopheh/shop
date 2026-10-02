import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import { ArrowLeftIcon } from "@/components/icons";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ShopNG`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) notFound();

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to all products
        </Link>
      </nav>

      <article className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Stock badge */}
          <div>
            {product.stock > 0 ? (
              <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-block bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
                Out of stock
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(product.price_kobo)}
          </p>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
            {product.description}
          </p>

          {/* Divider */}
          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Add to cart */}
          <div className="max-w-sm">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              priceKobo={product.price_kobo}
              imageUrl={product.image_url}
            />
          </div>

          {/* Trust badges */}
          <ul className="grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
            {[
              "🔒 Secure checkout",
              "🚚 Fast Nigeria delivery",
              "↩️ 30-day returns",
              "💬 24/7 support",
            ].map((badge) => (
              <li key={badge} className="flex items-center gap-1.5">
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </main>
  );
}
