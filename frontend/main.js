import RevolutCheckout from "@revolut/checkout";

const params = new URLSearchParams(window.location.search);

// 🔥 READ ORDER PUBLIC ID ONLY
const orderPublicId = params.get("order_public_id");

console.log("ORDER PUBLIC ID:", orderPublicId);

if (!orderPublicId) {
  throw new Error("Missing order_public_id");
}

// Initialize Revolut Checkout with the order public ID
const checkout = await RevolutCheckout(
  orderPublicId, 
  'prod' 
);

// Pay using ORDER PUBLIC ID
document.getElementById("payBtn").onclick = async () => {
  try {
    const orderId = String(orderPublicId).trim();
    
    // Log the order ID being used for debugging
    console.log('Attempting payment with order ID:', orderId);
    
    // Pay with popup - no need to pass orderId again as it's already set in the checkout instance
    await checkout.payWithPopup({
      savePaymentMethodFor: "customer",
      onSuccess() {
        console.log('Payment successful');
        alert("Payment successful");
        // Optional: Redirect or update UI on success
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
