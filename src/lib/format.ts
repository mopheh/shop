/** Formats a kobo integer as a Naira string: ₦1,234.56 */
export function formatPrice(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
