import { Router } from "express";

import paymenRouter from "./payment.routes.js";
import mbwayRouter from "./mbway.routes.js";

const rootRouter = Router();

rootRouter.use("/payments", paymenRouter);
rootRouter.use("/mbway", mbwayRouter);

export default rootRouter;
