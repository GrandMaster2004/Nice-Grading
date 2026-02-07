import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    player: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
    },
    playerName: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: String,
      required: [true, "Year is required"],
      trim: true,
    },
    set: {
      type: String,
      required: [true, "Set is required"],
      trim: true,
    },
    setName: {
      type: String,
      default: "",
      trim: true,
    },
    cardNumber: {
      type: String,
      required: [true, "Card number is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    id: {
      type: String,
      default: null,
    },
  },
  { _id: false, timestamps: true },
);

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  cards: {
    type: [cardSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "At least one card is required",
    },
  },
  cardCount: {
    type: Number,
    required: true,
    min: 1,
  },
  serviceTier: {
    type: String,
    enum: ["SPEED_DEMON", "THE_STANDARD", "BIG_MONEY"],
    required: true,
  },
  pricing: {
    basePrice: { type: Number, required: true },
    processingFee: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid",
    index: true,
  },
  submissionStatus: {
    type: String,
    enum: [
      "draft",
      "submitted",
      "in_review",
      "grading",
      "completed",
      "shipped",
    ],
    default: "draft",
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  stripeSetupIntentId: {
    type: String,
    default: null,
  },
  stripePaymentMethodId: {
    type: String,
    default: null,
  },
  orderSummary: {
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

// Index for common queries
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ submissionStatus: 1, paymentStatus: 1 });

export const Submission = mongoose.model("Submission", submissionSchema);
