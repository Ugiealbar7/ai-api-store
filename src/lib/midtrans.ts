export interface CreateTransactionParams {
  orderId: string;
  amount: number;
  userEmail: string;
  userName: string;
}

export async function createMidtransTransaction({
  orderId,
  amount,
  userEmail,
  userName,
}: CreateTransactionParams): Promise<{
  token?: string;
  redirectUrl?: string;
  isSimulated?: boolean;
}> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  // Mode Simulasi (jika belum mengisi API key Midtrans)
  if (!serverKey || serverKey.includes("demo-key") || serverKey.includes("xxxxxxxx")) {
    return {
      isSimulated: true,
      redirectUrl: `/dashboard/topup?simulated_success=true&order_id=${orderId}&amount=${amount}`,
    };
  }

  const endpoint = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(amount),
    },
    customer_details: {
      first_name: userName,
      email: userEmail,
    },
    enabled_payments: ["other_qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "mandiri_clickpay"],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Midtrans Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    redirectUrl: data.redirect_url,
    isSimulated: false,
  };
}
