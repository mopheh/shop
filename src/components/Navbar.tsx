import Link from "next/link";
import CartIcon from "./CartIcon";
import AuthButton from "./AuthButton";

// Navbar outer shell is a server component.
// CartIcon and AuthButton are client components (they read from context / session).
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white"
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white text-sm font-black"
            aria-hidden="true"
          >
            S
          </span>
          <span>ShopNG</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/orders"
            className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Orders
          </Link>
          <AuthButton />
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}
