import { Submission } from "../models/Submission.js";
import { Payment } from "../models/Payment.js";
import { validateSubmission } from "../middleware/validation.js";
import {
  calculatePricing,
  formatOrderSummary,
  asyncHandler,
} from "../utils/helpers.js";
import {
  createPaymentIntent,
  createSetupIntent,
  createOrUpdateCustomer,
} from "../utils/stripe.js";
import { User } from "../models/User.js";

export const createSubmission = asyncHandler(async (req, res) => {
  const { error, value } = validateSubmission(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const pricing = calculatePricing(value.cardCount, value.serviceTier);
  const orderSummary = formatOrderSummary(
    value.cards,
    value.cardCount,
    value.serviceTier,
    pricing,
  );

  const submission = new Submission({
    userId: req.userId,
    cards: value.cards,
    cardCount: value.cardCount,
    serviceTier: value.serviceTier,
    pricing,
    orderSummary,
    paymentStatus: "unpaid",
    submissionStatus: "Created",
  });

  await submission.save();

  res.status(201).json({
    success: true,
    submission,
  });
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ userId: req.userId }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    submissions,
  });
});

export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json({
    success: true,
    submission,
  });
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "Created",
    "Awaiting Shipment",
    "Received",
    "In Grading",
    "Ready for Payment",
    "Shipped",
    "Completed",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  submission.submissionStatus = status;
  submission.updatedAt = new Date();
  await submission.save();

  res.json({
    success: true,
    submission,
  });
});
