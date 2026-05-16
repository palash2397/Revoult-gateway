// import RevolutCheckout from "@revolut/checkout";

// const params = new URLSearchParams(window.location.search);


// const orderPublicId = params.get("order_public_id");

// console.log("ORDER PUBLIC ID:", orderPublicId);

// if (!orderPublicId) {
//   throw new Error("Missing order_public_id");
// }

// // Initialize Revolut Checkout with the order public ID
// const checkout = await RevolutCheckout(
//   orderPublicId,
//   'sandbox'
// );

// 'prod' or 'sandbox'

// Pay using ORDER PUBLIC ID
// document.getElementById("payBtn").onclick = async () => {
//   try {
//     const orderId = String(orderPublicId).trim();

//     console.log('Attempting payment with order ID:', orderId);


//     await checkout.payWithPopup({
//       savePaymentMethodFor: "customer",
//       onSuccess() {
//         console.log('Payment successful');
//         // alert("Payment successful");
//       },
//       onError(error) {
//         console.error('Payment error details:', {
//           error,
//           orderId,
//           timestamp: new Date().toISOString()
//         });
//         alert(`Payment failed: ${error?.message || 'Unknown error'}`);
//       }
//     });
//   } catch (error) {
//     console.error('Error in payment handler:', error);
//     alert(`An error occurred: ${error.message}`);
//   }
// };



import RevolutCheckout from "@revolut/checkout";

const params = new URLSearchParams(window.location.search);
const orderPublicId = params.get("order_public_id");

console.log("ORDER PUBLIC ID:", orderPublicId);

if (!orderPublicId) {
  throw new Error("Missing order_public_id");
}

// ─── Card payment (unchanged) ─────────────────────────────────────────────
const checkout = await RevolutCheckout(orderPublicId, "sandbox");

document.getElementById("payBtn").onclick = async () => {
  try {
    await checkout.payWithPopup({
      savePaymentMethodFor: "customer",
      onSuccess() {
        console.log("Card payment successful");
        window.location.href = `/revoult/ride-confirmed?order_public_id=${orderPublicId}`;
      },
      onError(error) {
        console.error("Payment error:", error);
        alert(`Payment failed: ${error?.message || "Unknown error"}`);
      },
    });
  } catch (error) {
    console.error("Error in payment handler:", error);
    alert(`An error occurred: ${error.message}`);
  }
};


// ─── Google Pay ───────────────────────────────────────────────────────────
const setupGooglePay = async () => {
  try {
    const googlePayTarget = document.getElementById("google-pay-btn");

    if (!googlePayTarget) {
      console.warn("google-pay-btn element not found — skipping Google Pay");
      return;
    }

    const { paymentRequest } = await RevolutCheckout.payments({
      publicToken: "pk_0blvy58RYFGhKvdhcH9JAXpMPBhYacieb2AhoYzIOcRz53Zr", // pk_... from dashboard
      mode: "sandbox",
    });

    const instance = paymentRequest(googlePayTarget, {
      currency: "EUR",
      amount: 2000, // €20.00 — replace with dynamic value if needed

      createOrder: async () => {
        return { publicId: orderPublicId }; // reuse existing order
      },

      onSuccess() {
        console.log("Google Pay successful");
        // ✅ Fixed: correct base path + correct param name
        window.location.href = `/revoult/ride-confirmed?order_public_id=${orderPublicId}`;
      },

      onError(error) {
        console.error("Google Pay error:", error.message);
        alert(`Google Pay failed: ${error.message}`);
      },

      onCancel() {
        console.log("User cancelled Google Pay");
      },
    });

    const method = await instance.canMakePayment();

    if (method) {
      instance.render();
      document.getElementById("google-pay-btn").style.display = "block";
      // ✅ Don't hide payBtn — show both buttons
      console.log("Google Pay rendered");
    } else {
      instance.destroy();
      document.getElementById("google-pay-btn").style.display = "none";
      console.log("Google Pay not available, showing card payment only");
    }

  } catch (error) {
    console.error("Google Pay setup error:", error);
    // Silently fall back to card button
    document.getElementById("payBtn").style.display = "block";
  }
};

setupGooglePay();








