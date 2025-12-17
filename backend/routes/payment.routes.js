import { Router } from 'express';
import { createOrderHandle, createCustomerHandle, getOrderHandle, getCustomerHandle, getCustomerPaymentsHandle, payOrderHandle } from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-customer', createCustomerHandle);
router.post('/create-order', createOrderHandle);
router.get('/order/:id', getOrderHandle)
router.get('/customer/:id', getCustomerHandle)
router.get("/customer/payment-methods/:id", getCustomerPaymentsHandle)
router.post("/order/pay", payOrderHandle)



export default router;
