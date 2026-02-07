import crypto from "crypto";
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

const normalizeCards = (cards, { userId, submissionId }) =>
  (cards || []).map((card) => ({
    ...card,
    id: card.id || crypto.randomUUID(),
    status: card.status || "unpaid",
    isDeleted: Boolean(card.isDeleted),
    userId,
    submissionId,
    playerName: card.playerName || card.player,
    setName: card.setName || card.set,
  }));

export const createSubmission = asyncHandler(async (req, res) => {
  const { error, value } = validateSubmission(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const normalizedCards = normalizeCards(value.cards, {
    userId: req.userId,
    submissionId: null,
  });

  const pricing = calculatePricing(normalizedCards);
  const orderSummary = formatOrderSummary(
    normalizedCards,
    value.cardCount,
    value.serviceTier,
    pricing,
  );

  const existingUnpaid = await Submission.findOne({
    userId: req.userId,
    paymentStatus: "unpaid",
  }).sort({ createdAt: -1 });

  if (existingUnpaid) {
    existingUnpaid.cards = normalizeCards(normalizedCards, {
      userId: req.userId,
      submissionId: existingUnpaid._id,
    });
    existingUnpaid.cardCount = value.cardCount;
    existingUnpaid.serviceTier = value.serviceTier;
    existingUnpaid.pricing = pricing;
    existingUnpaid.orderSummary = orderSummary;
    existingUnpaid.updatedAt = new Date();

    await existingUnpaid.save();

    return res.status(200).json({
      success: true,
      submission: existingUnpaid,
    });
  }

  const submission = new Submission({
    userId: req.userId,
    cards: normalizedCards,
    cardCount: value.cardCount,
    serviceTier: value.serviceTier,
    pricing,
    orderSummary,
    paymentStatus: "unpaid",
    submissionStatus: "draft",
  });

  await submission.save();

  submission.cards = normalizeCards(submission.cards, {
    userId: req.userId,
    submissionId: submission._id,
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

export const getPaidSubmissions = asyncHandler(async (req, res) => {
  // PRIMARY GATE: paymentStatus = 'paid' is mandatory
  // SECONDARY FILTER: submissionStatus must be in allowed finalized statuses
  const allowedStatuses = [
    "submitted",
    "in_review",
    "grading",
    "completed",
    "shipped",
  ];
  const submissions = await Submission.find({
    userId: req.userId,
    paymentStatus: "paid",
    submissionStatus: { $in: allowedStatuses },
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    submissions,
  });
});

export const getVaultSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    userId: req.userId,
    paymentStatus: "unpaid",
  }).sort({ createdAt: -1 });

  const sanitized = submissions.map((submission) => {
    const cards = (submission.cards || []).filter((card) => {
      if (card.isDeleted) {
        return false;
      }
      return !card.status || card.status === "unpaid";
    });

    return {
      ...submission.toObject(),
      cards,
      cardCount: cards.length,
    };
  });

  res.json({
    success: true,
    submissions: sanitized,
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

export const updateSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cards, cardCount, serviceTier } = req.body;

  const submission = await Submission.findById(id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // Verify ownership
  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Only allow updates to unpaid submissions
  if (submission.paymentStatus === "paid") {
    return res.status(400).json({ error: "Cannot update paid submissions" });
  }

  // Update submission
  const normalizedCards = normalizeCards(cards, {
    userId: req.userId,
    submissionId: submission._id,
  });

  submission.cards = normalizedCards;
  submission.cardCount =
    cardCount || normalizedCards.filter((c) => !c.isDeleted).length;
  if (serviceTier) submission.serviceTier = serviceTier;

  const pricing = calculatePricing(normalizedCards.filter((c) => !c.isDeleted));
  submission.pricing = pricing;
  submission.orderSummary = formatOrderSummary(
    normalizedCards.filter((c) => !c.isDeleted),
    submission.cardCount,
    submission.serviceTier,
    pricing,
  );

  await submission.save();

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

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  // Fetch all submissions for the user
  const submissions = await Submission.find({ userId: req.userId });

  // Calculate metrics
  let totalSubmissions = 0;
  let completedCards = 0;
  let unpaidCards = 0;
  let unpaidAmount = 0;

  submissions.forEach((submission) => {
    if (submission.cards && Array.isArray(submission.cards)) {
      submission.cards.forEach((card) => {
        if (!card.isDeleted) {
          // Count all non-deleted cards for TOTAL SUBMISSIONS
          totalSubmissions++;

          // Count paid cards for COMPLETED
          if (card.status === "paid") {
            completedCards++;
          }

          // Count unpaid cards and amount for UNPAID metrics
          if (card.status !== "paid") {
            unpaidCards++;
            unpaidAmount += card.price || 0;
          }
        }
      });
    }
  });

  res.json({
    totalSubmissions,
    completedCards,
    unpaidCards,
    unpaidAmount,
  });
});
