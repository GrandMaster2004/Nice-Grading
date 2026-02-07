import { Submission } from "../models/Submission.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/helpers.js";
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createSetupIntent,
  chargeCustomer,
  createOrUpdateCustomer,
} from "../utils/stripe.js";

export const payNow = asyncHandler(async (req, res) => {
  const { submissionId, paymentMethodId } = req.body;

  if (!submissionId || !paymentMethodId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (submission.paymentStatus === "paid") {
    return res.status(400).json({ error: "Submission already paid" });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const paymentIntent = await createPaymentIntent(
    submission.pricing.total,
    user.stripeCustomerId,
  );

  submission.stripePaymentIntentId = paymentIntent.id;
  submission.updatedAt = new Date();
  await submission.save();

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    submissionId: submission._id,
    paymentIntentId: paymentIntent.id,
  });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { submissionId, paymentIntentId } = req.body;

  if (!submissionId || !paymentIntentId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  // Create payment record
  const payment = new Payment({
    submissionId: submission._id,
    userId: req.userId,
    amount: submission.pricing.total,
    currency: "usd",
    paymentType: "pay_now",
    stripePaymentIntentId: paymentIntentId,
    status: "succeeded",
  });

  submission.paymentStatus = "paid";
  submission.submissionStatus = "submitted";
  submission.cards = (submission.cards || []).map((card) =>
    card.isDeleted ? card : { ...card, status: "paid" },
  );
  submission.updatedAt = new Date();

  await Promise.all([payment.save(), submission.save()]);

  res.json({
    success: true,
    message: "Payment successful",
    submission,
  });
});

export const payLater = asyncHandler(async (req, res) => {
  const { submissionId } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: "Submission ID is required" });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (submission.paymentStatus === "paid") {
    return res.status(400).json({ error: "Submission already paid" });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const setupIntent = await createSetupIntent(user.stripeCustomerId);

  submission.stripeSetupIntentId = setupIntent.id;
  await submission.save();

  res.json({
    success: true,
    clientSecret: setupIntent.client_secret,
    submissionId: submission._id,
    message: "Setup intent created for payment method",
  });
});

export const confirmPaymentMethod = asyncHandler(async (req, res) => {
  const { submissionId, setupIntentId, paymentMethodId } = req.body;

  if (!submissionId || !setupIntentId || !paymentMethodId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  if (submission.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  submission.stripePaymentMethodId = paymentMethodId;
  submission.paymentStatus = "unpaid";
  // Keep status as draft since payment hasn't been finalized yet
  submission.updatedAt = new Date();

  await submission.save();

  res.json({
    success: true,
    message:
      "Payment method saved. You will be charged when grading is complete.",
    submission,
  });
});
