import { Router } from "express";
import {
    createOrderHandle,
    createCustomerHandle,
    getOrderHandle,
    getCustomerHandle,
    getCustomerPaymentsHandle,
    payOrderHandle,
    createOrderAuthHandle,
    capturePaymentHandle,
    releasePaymentHandle
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-customer", createCustomerHandle);
router.post("/create-order", createOrderHandle);

router.get("/order/:id", getOrderHandle);
router.get("/customer/:id", getCustomerHandle);
router.get("/customer/payment-methods/:id", getCustomerPaymentsHandle);
router.post("/order/pay", payOrderHandle);


router.post("/create-order/auth", createOrderAuthHandle);
router.patch("/order/capture", capturePaymentHandle);
router.patch("/order/release/:id", releasePaymentHandle);

export default router;
