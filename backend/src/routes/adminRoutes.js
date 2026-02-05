import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import {
  getAllSubmissions,
  updateSubmissionStatus,
  getSubmissionAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/submissions", getAllSubmissions);
router.patch("/submissions/:id/status", updateSubmissionStatus);
router.get("/analytics", getSubmissionAnalytics);

export default router;
