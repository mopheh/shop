"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CheckIcon, ShoppingCartIcon } from "./icons";

interface AddToCartButtonProps {
  productId: number;
  name: string;
  priceKobo: number;
  imageUrl: string;
}

export default function AddToCartButton({
  productId,
  name,
  priceKobo,
  imageUrl,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, priceKobo, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      id={`add-to-cart-${productId}`}
      onClick={handleClick}
      aria-label={`Add ${name} to cart`}
      className={`
        flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm
        transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500
        ${
          added
            ? "bg-green-600 text-white scale-95"
            : "bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-md hover:shadow-green-200 dark:hover:shadow-green-900"
        }
      `}
    >
      {added ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}
