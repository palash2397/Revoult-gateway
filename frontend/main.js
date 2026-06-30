import RevolutCheckout from "@revolut/checkout";

const params = new URLSearchParams(window.location.search);
const orderPublicId = params.get("order_public_id");
const amount = parseInt(params.get("amount")) || 2000;
const method = params.get("method");

// console.log("ORDER PUBLIC ID:", orderPublicId);
// console.log("AMOUNT:", amount);

if (!orderPublicId) {
  throw new Error("Missing order_public_id");
}

const REVOLUT_PUBLIC_KEY =
  "pk_0blvy58RYFGhKvdhcH9JAXpMPBhYacieb2AhoYzIOcRz53Zr";
const MODE = "sandbox"; // "sandbox" or "prod"
const SUCCESS_URL = `/revoult/ride-confirmed?order_public_id=${orderPublicId}`;

// ─── Poll order status ────────────────────────────────────────────────────
const waitForPaymentComplete = async (maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(`/api/ride/order-status/${orderPublicId}`);
    const data = await res.json();
    console.log(`Poll ${i + 1}: state = ${data.state}`);
    if (data.state === "COMPLETED" || data.state === "AUTHORISED") return true;
    if (data.state === "CANCELLED" || data.state === "FAILED") return false;
  }
  return false;
};

const handleAfterWalletPay = async () => {
  const success = await waitForPaymentComplete();
  if (success) {
    window.location.href = SUCCESS_URL;
  }
};

// ─── Card Payment Setup ───────────────────────────────────────────────────
const setupCardPayment = async () => {
  const checkout = await RevolutCheckout(orderPublicId, MODE);

  const payBtn = document.getElementById("payBtn");
  payBtn.style.display = "block";

  payBtn.onclick = async () => {
    try {
      await checkout.payWithPopup({
        savePaymentMethodFor: "customer",
        onSuccess() {
          window.location.href = SUCCESS_URL;
        },
        onError(error) {
          alert(`Payment failed: ${error?.message || "Unknown error"}`);
        },
      });
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };
};

// ─── Apple Pay Setup ──────────────────────────────────────────────────────
const setupApplePay = async () => {
  try {
    const appleTarget = document.getElementById("apple-pay-btn");
    if (!appleTarget) return;

    const { paymentRequest } = await RevolutCheckout.payments({
      publicToken: REVOLUT_PUBLIC_KEY,
      mode: MODE,
      locale: "pt",
    });

    const appleInstance = paymentRequest(appleTarget, {
      currency: "EUR",
      amount,
      createOrder: async () => ({ publicId: orderPublicId }),
      onSuccess() {
        window.location.href = SUCCESS_URL;
      },
      onError(error) {
        alert(`Apple Pay failed: ${error.message}`);
      },
      onCancel() {
        handleAfterWalletPay();
      },
    });

    const appleMethod = await appleInstance.canMakePayment();
    console.log("Apple Pay canMakePayment:", appleMethod);

    if (appleMethod === "applePay") {
      appleInstance.render();
      appleTarget.style.display = "block";
    } else {
      appleInstance.destroy();
      appleTarget.style.display = "none";
      alert("Apple Pay não está disponível neste dispositivo.");
    }
  } catch (error) {
    console.error("Apple Pay setup error:", error);
  }
};

// ─── Init based on method param ───────────────────────────────────────────
const init = async () => {
  if (method === "apple_pay") {
    await setupApplePay();
  } else {
    // default to card if method missing or = "card"
    await setupCardPayment();
  }
};

init();
