import RevolutCheckout from "@revolut/checkout";

const params = new URLSearchParams(window.location.search);
const orderPublicId = params.get("order_public_id");
const amount = parseInt(params.get("amount")) || 2000;

console.log("ORDER PUBLIC ID:", orderPublicId);
console.log("AMOUNT:", amount);

if (!orderPublicId) {
  throw new Error("Missing order_public_id");
}

const REVOLUT_PUBLIC_KEY =
  "pk_w7enNtJtvg9Vm6QGWb3DXbUuiwQ5innUaRzbjZG6Y24PXDyH"; // your production public key
const MODE = "prod"; // "sandbox" or "prod"
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

// ─── 1. Card Payment ──────────────────────────────────────────────────────
const checkout = await RevolutCheckout(orderPublicId, MODE);

document.getElementById("payBtn").onclick = async () => {
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

// // ─── 2. Google Pay ────────────────────────────────────────────────────────
// const setupGooglePay = async () => {
//   try {
//     const target = document.getElementById("google-pay-btn");
//     if (!target) return;

//     const { paymentRequest } = await RevolutCheckout.payments({
//       publicToken: REVOLUT_PUBLIC_KEY,
//       mode: MODE,
//       locale: "pt",
//     });

//     const instance = paymentRequest(target, {
//       currency: "EUR",
//       amount,
//       preferredPaymentMethod: "googlePay", // ✅ force Google Pay only
//       createOrder: async () => ({ publicId: orderPublicId }),
//       onSuccess() {
//         window.location.href = SUCCESS_URL;
//       },
//       onError(error) {
//         console.error("Google Pay error:", error.message);
//         alert(`Google Pay failed: ${error.message}`);
//       },
//       onCancel() {
//         handleAfterWalletPay();
//       },
//     });

//     const method = await instance.canMakePayment();
//     if (method === "googlePay") {
//       instance.render();
//       target.style.display = "block";
//       console.log("Google Pay rendered");
//     } else {
//       instance.destroy();
//       console.log("Google Pay not available");
//     }

//   } catch (error) {
//     console.error("Google Pay setup error:", error);
//   }
// };

// // ─── 3. Apple Pay ─────────────────────────────────────────────────────────
// const setupApplePay = async () => {
//   try {
//     const target = document.getElementById("apple-pay-btn");
//     if (!target) return;

//     const { paymentRequest } = await RevolutCheckout.payments({
//       publicToken: REVOLUT_PUBLIC_KEY,
//       mode: MODE,
//       locale: "pt",
//     });

//     const instance = paymentRequest(target, {
//       currency: "EUR",
//       amount,
//       preferredPaymentMethod: "applePay", // ✅ force Apple Pay only
//       createOrder: async () => ({ publicId: orderPublicId }),
//       onSuccess() {
//         window.location.href = SUCCESS_URL;
//       },
//       onError(error) {
//         console.error("Apple Pay error:", error.message);
//         alert(`Apple Pay failed: ${error.message}`);
//       },
//       onCancel() {
//         handleAfterWalletPay();
//       },
//     });

//     const method = await instance.canMakePayment();
//     if (method === "applePay") {
//       instance.render();
//       target.style.display = "block";
//       console.log("Apple Pay rendered");
//     } else {
//       instance.destroy();
//       console.log("Apple Pay not available on this device/browser");
//     }

//   } catch (error) {
//     console.error("Apple Pay setup error:", error);
//   }
// };

// // ─── Init all ─────────────────────────────────────────────────────────────
// setupGooglePay();
// setupApplePay();

const setupWalletButtons = async () => {
  try {
    // ✅ Single initialisation — faster
    const { paymentRequest } = await RevolutCheckout.payments({
      publicToken: REVOLUT_PUBLIC_KEY,
      mode: MODE,
    });

    // ── Google Pay ──────────────────────────────────────────────────
    const googleTarget = document.getElementById("google-pay-btn");
    if (googleTarget) {
      const googleInstance = paymentRequest(googleTarget, {
        currency: "EUR",
        amount,
        createOrder: async () => ({ publicId: orderPublicId }),
        onSuccess() {
          window.location.href = SUCCESS_URL;
        },
        onError(error) {
          alert(`Google Pay failed: ${error.message}`);
        },
        onCancel() {
          handleAfterWalletPay();
        },
      });

      const googleMethod = await googleInstance.canMakePayment();
      console.log("Google Pay canMakePayment:", googleMethod);

      if (googleMethod === "googlePay") {
        googleInstance.render();
        googleTarget.style.display = "block";
      } else {
        googleInstance.destroy();
        googleTarget.style.display = "none";
      }
    }

    // ── Apple Pay ───────────────────────────────────────────────────
    const appleTarget = document.getElementById("apple-pay-btn");
    if (appleTarget) {
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
      }
    }
  } catch (error) {
    console.error("Wallet setup error:", error);
  }
};

setupWalletButtons();
