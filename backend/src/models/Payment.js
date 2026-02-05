import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, "Amount must be greater than 0"],
  },
  currency: {
    type: String,
    default: "usd",
    uppercase: true,
  },
  paymentType: {
    type: String,
    enum: ["pay_now", "pay_later"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
    index: true,
  },
  stripeChargeId: {
    type: String,
    default: null,
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ submissionId: 1 });

export const Payment = mongoose.model("Payment", paymentSchema);
