import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  payNow,
  confirmPayment,
  payLater,
  confirmPaymentMethod,
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/pay-now", payNow);
router.post("/confirm-payment", confirmPayment);
router.post("/pay-later", payLater);
router.post("/confirm-payment-method", confirmPaymentMethod);

export default router;
