import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
} from "../controllers/submissionController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createSubmission);
router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);
router.patch("/:id/status", updateSubmissionStatus);

export default router;
