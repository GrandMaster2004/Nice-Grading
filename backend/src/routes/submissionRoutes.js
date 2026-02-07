import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createSubmission,
  getSubmissions,
  getVaultSubmissions,
  getPaidSubmissions,
  getSubmissionById,
  updateSubmission,
} from "../controllers/submissionController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createSubmission);
router.get("/vault", getVaultSubmissions);
router.get("/paid", getPaidSubmissions);
router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);
router.put("/:id", updateSubmission);

export default router;
