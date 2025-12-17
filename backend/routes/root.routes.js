import { Router } from 'express';
import paymenRouter from './payment.routes';
const rootRouter = Router();

rootRouter.use("/payment", paymenRouter)


export default rootRouter;
