import { ApiResponse } from "../utils/ApiResponse.js";
import { revolutClient } from "../config/revolut.config.js";

export const createCustomerHandle = async (req, res) => {
    try {
        const { full_name, business_name, email, phone, date_of_birth } = req.body;

        const response = await revolutClient.post("/api/1.0/customers", {
            full_name,
            business_name,
            email,
            phone,
            date_of_birth,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    customer_id: response.data.id,
                    data: response.data,
                },
                `customer created successfully`,
            ),
        );
    } catch (error) {
        res.status(400).json({
            error: error.response?.data || error.message,
        });
    }
};

export const payOrderHandle = async (req, res) => {
    try {
        const { order_id, payment_method_id } = req.body;

        const response = await revolutClient.post(
            `/api/orders/${order_id}/payments`, // ✅ NO 1.0 here
            {
                saved_payment_method: {
                    type: "card",
                    id: payment_method_id,
                    initiator: "customer",
                    environment: {
                        type: "browser",
                        browser_url: "https://yourapp.com",
                        time_zone_utc_offset: 330,
                        color_depth: 24,
                        screen_width: 1920,
                        screen_height: 1080,
                        java_enabled: false,
                        challenge_window_width: 640,
                    },
                },
            },
        );

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.log(`error while paying order`, error);
        return res.status(400).json({
            error: error.response?.data || error.message,
        });
    }
};

export const createOrderHandle = async (req, res) => {
    try {
        const { amount, currency, customer_id } = req.body;

        const response = await revolutClient.post("/api/1.0/orders", {
            amount,
            currency,
            customer_id,
            setup_future_usage: "ON_SESSION",
        });

        // console.log("response ----->", response);
        //const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}`;
        const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}&amount=${amount}`;
        return res.status(200).json({
            order_id: response.data.id,
            status: response.data.status,
            data: response.data,
            url,
        });
    } catch (error) {
        console.log(`error while creating order`, error);
        res.status(400).json({
            error: error.response?.data || error.message,
        });
    }
};

export const getOrderHandle = async (req, res) => {
    try {
        const id = req.params.id;

        const response = await revolutClient.get(`/api/1.0/orders/${id}`);

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.log(`error getting the order`, error);
        return res
            .status(501)
            .json(new ApiResponse(500, {}, `Internal server error`));
    }
};

export const getCustomerHandle = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await revolutClient.get(`/api/1.0/customers/${id}`);

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.log(`error getting the order`, error);
        return res
            .status(501)
            .json(new ApiResponse(500, {}, `Internal server error`));
    }
};

export const getCustomerPaymentsHandle = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await revolutClient.get(
            `/api/1.0/customers/${id}/payment-methods`,
        );

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.log(`error getting the order`, error);
        return res
            .status(501)
            .json(new ApiResponse(500, {}, `Internal server error`));
    }
};

export const createOrderAuthHandle = async (req, res) => {
    try {
        const { amount, currency, customer_id } = req.body;

        const response = await revolutClient.post("/api/1.0/orders", {
            amount,
            currency,
            customer_id,
            capture_mode: "MANUAL",
            authorisation_type: "pre_authorisation",
            setup_future_usage: "ON_SESSION",
        });

        console.log("response ----->", response);
        const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}`;
        return res.status(200).json({
            order_id: response.data.id,
            status: response.data.status,
            data: response.data,
            url,
        });
    } catch (error) {
        console.log(`error while creating order`, error);
        res.status(400).json({
            error: error.response?.data || error.message,
        });
    }
};

export const capturePaymentHandle = async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required",
            });
        }

        const response = await revolutClient.post(
            `/api/orders/${orderId}/capture`,
            { amount },
        );

        const message =
            reason === "user_cancelled"
                ? "Cancellation fee captured, remaining amount released to customer"
                : "Full ride payment captured successfully";

        return res.status(200).json({
            success: true,
            message,
            state: response.data.state, // will be "completed"
            captured_amount: amount,
            data: response.data,
        });
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to capture payment",
            error: error.response?.data || error.message,
        });
    }
};

export const releasePaymentHandle = async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        const response = await revolutClient.post(
            `/api/1.0/orders/${orderId}/cancel`,
        );

        return res.status(200).json({
            success: true,
            message: "Payment hold released, full amount returned to customer",
            state: response.data.state, // will be "cancelled"
            data: response.data,
        });
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to release payment",
            error: error.response?.data || error.message,
        });
    }
};

// const customerData = {
//   full_name: "Example Customer",
//   email: "example.customer@example.com",
//   phone: "+441234567890",
//   date_of_birth: "1990-01-01",
//   country: "GB"
// };

// try {
//   const response = await axios.post(
//     "https://sandbox-merchant.revolut.com/api/1.0/customers",
//     customerData,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         "Authorization": `Bearer sk_hDAxJ4W6zzTH5u96aMXXGtmzCYMWLMfFUxx7Dx3p3-skQw4_HXjCrJnNwnXSZ-aZ`
//       }
//     }
//   );

//   console.log("Customer created:", response.data);
// } catch (error) {
//   console.error("Revolut error:", error.response?.data || error.message);
// }

// let data = JSON.stringify({
//     "amount": 500,
//     "currency": "GBP"
// });

// let config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: 'https://sandbox-merchant.revolut.com/api/1.0/orders',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': 'Bearer sk_hDAxJ4W6zzTH5u96aMXXGtmzCYMWLMfFUxx7Dx3p3-skQw4_HXjCrJnNwnXSZ-aZ'
//     },
//     data: data
// };

// axios(config)
//     .then((response) => {
//         console.log(JSON.stringify(response.data));
//     })
//     .catch((error) => {
//         console.log(error);
//     });
