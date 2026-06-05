import { Router } from "express";

import paymenRouter from "./payment.routes";
import mbwayRouter from "./mbway.routes.js";
const rootRouter = Router();

rootRouter.use("/payment", paymenRouter);
rootRouter.use("/mbway", mbwayRouter);

export default rootRouter;
