import { Submission } from "../models/Submission.js";
import { Payment } from "../models/Payment.js";
import { asyncHandler } from "../utils/helpers.js";
import { chargeCustomer } from "../utils/stripe.js";
import { User } from "../models/User.js";

const PAGE_SIZE = 50;

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const status = req.query.status;

  // ALL SUBMISSIONS: Show ONLY paid + finalized submissions
  // paymentStatus must be 'paid' AND submissionStatus must be in ('submitted', 'completed')
  const filter = {
    paymentStatus: "paid",
    submissionStatus: { $in: ["submitted", "completed"] },
  };

  if (status && ["submitted", "completed"].includes(status)) {
    filter.submissionStatus = status;
  }

  const total = await Submission.countDocuments(filter);
  const submissions = await Submission.find(filter)
    .select(
      "_id userId createdAt cardCount paymentStatus submissionStatus pricing",
    )
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE)
    .skip((page - 1) * PAGE_SIZE);

  // Transform to return only submission-level data (no cards)
  const submissionData = submissions.map((submission) => ({
    _id: submission._id,
    userId: submission.userId,
    submissionId: submission._id,
    submissionDate: submission.createdAt,
    numberOfCards: submission.cardCount,
    paymentStatus: submission.paymentStatus,
    submissionStatus: submission.submissionStatus,
    amount: submission.pricing.total,
    createdAt: submission.createdAt,
  }));

  res.json({
    success: true,
    submissions: submissionData,
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

  // Only allow submitted and completed statuses for ALL SUBMISSIONS visibility
  const validStatuses = [
    "draft",
    "submitted",
    "in_review",
    "grading",
    "completed",
    "shipped",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const submission = await Submission.findById(id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
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
  const unpaidRevenueAgg = await Submission.aggregate([
    { $match: { paymentStatus: "unpaid" } },
    { $group: { _id: null, total: { $sum: "$pricing.total" } } },
  ]);
  const paidRevenueAgg = await Submission.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$pricing.total" } } },
  ]);
  const totalRevenue = await Payment.aggregate([
    { $match: { status: "succeeded" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const completedSubmissions = await Submission.countDocuments({
    submissionStatus: "completed",
  });

  const inGradingCount = await Submission.countDocuments({
    submissionStatus: "grading",
  });

  res.json({
    success: true,
    analytics: {
      totalSubmissions,
      completedSubmissions,
      inGradingCount,
      paidSubmissions,
      totalRevenue: totalRevenue[0]?.total || 0,
      unpaidRevenue: unpaidRevenueAgg[0]?.total || 0,
      paidRevenue: paidRevenueAgg[0]?.total || 0,
    },
  });
});
