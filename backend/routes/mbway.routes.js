import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentStatus,
  createFullRefund,
} from "../controllers/mbway.controller.js";

const mbwayRouter = Router();

mbwayRouter.post("/create-payment", createPaymentIntent);
mbwayRouter.get("/status/:paymentIntentId", getPaymentStatus);
mbwayRouter.post("/full/refund", createFullRefund);

export default mbwayRouter;
