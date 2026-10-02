"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "./icons";
import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <ShoppingCartIcon className="w-6 h-6" />
      {totalItems > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full px-1 leading-none"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
