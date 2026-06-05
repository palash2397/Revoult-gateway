import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentStatus,
} from "../controllers/mbway.controller.js";

const mbwayRouter = Router();

mbwayRouter.post("/create-payment", createPaymentIntent);
mbwayRouter.get("/status/:paymentIntentId", getPaymentStatus);

export default mbwayRouter;
