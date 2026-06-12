import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentStatus,
  createFullRefund,
  createPartialRefund,
} from "../controllers/mbway.controller.js";

const mbwayRouter = Router();

mbwayRouter.post("/create-payment", createPaymentIntent);
mbwayRouter.get("/status/:paymentIntentId", getPaymentStatus);
mbwayRouter.post("/full/refund", createFullRefund);
mbwayRouter.post("/partial/refund", createPartialRefund);

export default mbwayRouter;
