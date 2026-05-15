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
        alert("Payment successful");
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
