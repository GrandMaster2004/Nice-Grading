import { Submission } from "../models/Submission.js";
import { Payment } from "../models/Payment.js";
import { asyncHandler } from "../utils/helpers.js";
import { chargeCustomer } from "../utils/stripe.js";
import { User } from "../models/User.js";

const PAGE_SIZE = 50;

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const status = req.query.status;
  const paymentStatus = req.query.paymentStatus;

  const filter = {};
  if (status) filter.submissionStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const total = await Submission.countDocuments(filter);
  const submissions = await Submission.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE)
    .skip((page - 1) * PAGE_SIZE);

  res.json({
    success: true,
    submissions,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
});

export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
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

  const submission = await Submission.findById(id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // Auto-charge logic when status becomes 'Completed'
  if (status === "Completed" && submission.paymentStatus === "unpaid") {
    if (submission.stripePaymentMethodId) {
      try {
        const user = await User.findById(submission.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const paymentIntent = await chargeCustomer(
          user.stripeCustomerId,
          submission.pricing.total,
          submission.stripePaymentMethodId,
        );

        // Create payment record
        const payment = new Payment({
          submissionId: submission._id,
          userId: submission.userId,
          amount: submission.pricing.total,
          currency: "usd",
          paymentType: "pay_later",
          stripePaymentIntentId: paymentIntent.id,
          status: "succeeded",
        });

        submission.paymentStatus = "paid";
        submission.submissionStatus = status;
        submission.stripePaymentIntentId = paymentIntent.id;
        submission.updatedAt = new Date();

        await Promise.all([payment.save(), submission.save()]);

        return res.json({
          success: true,
          message: "Status updated and payment charged",
          submission,
        });
      } catch (error) {
        console.error("[STRIPE CHARGE ERROR]", {
          submissionId: submission._id,
          error: error.message,
        });

        return res.status(400).json({
          error: "Failed to charge payment method",
          details: error.message,
        });
      }
    }
  }

  submission.submissionStatus = status;
  submission.updatedAt = new Date();
  await submission.save();

  res.json({
    success: true,
    message: "Status updated successfully",
    submission,
  });
});

export const getSubmissionAnalytics = asyncHandler(async (req, res) => {
  const totalSubmissions = await Submission.countDocuments();
  const paidSubmissions = await Submission.countDocuments({
    paymentStatus: "paid",
  });
  const totalRevenue = await Payment.aggregate([
    { $match: { status: "succeeded" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const completedSubmissions = await Submission.countDocuments({
    submissionStatus: "Completed",
  });

  const inGradingCount = await Submission.countDocuments({
    submissionStatus: "In Grading",
  });

  const pendingPaymentCount = await Submission.countDocuments({
    paymentStatus: "unpaid",
    submissionStatus: "Ready for Payment",
  });

  res.json({
    success: true,
    analytics: {
      totalSubmissions,
      completedSubmissions,
      inGradingCount,
      paidSubmissions,
      pendingPaymentCount,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
  });
});
