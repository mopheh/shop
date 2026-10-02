/**
 * Email module — the only file that talks to Mailgun.
 * A failure here must NOT fail the order (callers are responsible for catching).
 */

const MAILGUN_API_URL = "https://api.mailgun.net/v3";

export interface OrderConfirmationData {
  to: string;
  toName: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; unitPriceKobo: number }>;
  totalKobo: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

function formatKobo(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export async function sendOrderConfirmation(
  data: OrderConfirmationData
): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !domain || !from) {
    throw new Error("Mailgun environment variables are not configured");
  }

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatKobo(item.unitPriceKobo)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatKobo(item.unitPriceKobo * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="font-size:24px;margin-bottom:4px">Order Confirmed 🎉</h1>
      <p style="color:#555;margin-top:0">Hi ${data.toName}, thank you for your order!</p>

      <h2 style="font-size:18px;margin-top:32px">Order #${data.orderId}</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Unit Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;margin-top:16px">
        Total: ${formatKobo(data.totalKobo)}
      </p>

      <h2 style="font-size:18px;margin-top:32px">Shipping to</h2>
      <p style="margin:0">${data.shippingAddress}</p>
      <p style="margin:0">${data.shippingCity}, ${data.shippingState} ${data.shippingZip}</p>

      <p style="color:#888;font-size:12px;margin-top:40px">
        This email was sent automatically. Please do not reply.
      </p>
    </body>
    </html>
  `;

  const body = new URLSearchParams({
    from,
    to: `${data.toName} <${data.to}>`,
    subject: `Order #${data.orderId} confirmed — ShopNG`,
    html,
  });

  const response = await fetch(`${MAILGUN_API_URL}/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailgun error ${response.status}: ${text}`);
  }
}
