import RevolutCheckout from "@revolut/checkout";

const params = new URLSearchParams(window.location.search);


const orderPublicId = params.get("order_public_id");

console.log("ORDER PUBLIC ID:", orderPublicId);

if (!orderPublicId) {
  throw new Error("Missing order_public_id");
}

// Initialize Revolut Checkout with the order public ID
const checkout = await RevolutCheckout(
  orderPublicId,
  'sandbox'
);

// 'prod' or 'sandbox'

// Pay using ORDER PUBLIC ID
document.getElementById("payBtn").onclick = async () => {
  try {
    const orderId = String(orderPublicId).trim();

    console.log('Attempting payment with order ID:', orderId);


    await checkout.payWithPopup({
      savePaymentMethodFor: "customer",
      onSuccess() {
        console.log('Payment successful');
        // alert("Payment successful");
      },
      onError(error) {
        console.error('Payment error details:', {
          error,
          orderId,
          timestamp: new Date().toISOString()
        });
        alert(`Payment failed: ${error?.message || 'Unknown error'}`);
      }
    });
  } catch (error) {
    console.error('Error in payment handler:', error);
    alert(`An error occurred: ${error.message}`);
  }
};




// ─── Step 2: Setup Google Pay button (new) ───────────────────────────────
const setupGooglePay = async () => {
  try {
    const { paymentRequest } = await RevolutCheckout.payments({
      publicToken: "pk_0blvy58RYFGhKvdhcH9JAXpMPBhYacieb2AhoYzIOcRz53Zr",
      mode: "sandbox", // change to "prod" in production
    });

    const googlePayTarget = document.getElementById("google-pay-btn");

    const instance = paymentRequest(googlePayTarget, {
      currency: "EUR",
      amount: getAmountFromPage(), // get the ride amount — see below

      createOrder: async () => {
        // ✅ Don't create a new order — reuse the existing one
        return { publicId: orderPublicId };
      },

      onSuccess() {
        console.log("Google Pay successful");
        window.location.href = `/ride-confirmed?order=${orderPublicId}`;
      },

      onError(error) {
        console.error("Google Pay error:", error.message);
        alert(`Google Pay failed: ${error.message}`);
      },

      onCancel() {
        console.log("User cancelled Google Pay");
      },
    });

    // ─── Step 3: Show Google Pay OR fallback to card button ───────────────
    const method = await instance.canMakePayment();

    if (method) {
      // Google Pay is available on this device
      instance.render();
      document.getElementById("google-pay-btn").style.display = "block";
      document.getElementById("payBtn").style.display = "none"; // hide card button
      console.log("Google Pay rendered");
    } else {
      // Google Pay not available — keep the existing card "Pay Now" button
      instance.destroy();
      document.getElementById("google-pay-btn").style.display = "none";
      document.getElementById("payBtn").style.display = "block";
      console.log("Google Pay not available, showing card payment");
    }

  } catch (error) {
    console.error("Google Pay setup error:", error);
    // If Google Pay setup fails, fall back to card button silently
    document.getElementById("payBtn").style.display = "block";
  }
};

// Amount must match what was pre-authorised when order was created
const getAmountFromPage = () => {
  // Option A: hardcode for now during testing
  return 2000; // €20.00 in minor units

  // Option B: pass it in the URL e.g. ?order_public_id=xxx&amount=2000
  // return parseInt(params.get("amount"));
};

setupGooglePay();





