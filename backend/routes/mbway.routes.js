import { Router } from "express";
import { createPaymentIntent } from "../controllers/mbway.controller.js";

const mbwayRouter = Router();

mbwayRouter.post("/create-payment", createPaymentIntent);

export default mbwayRouter;
