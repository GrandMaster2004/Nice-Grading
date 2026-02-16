import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "https://nice-grading.vercel.app",
  "https://vm-rruwv5imouzvf4bwun0o7o.vusercontent.net",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later" });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many login attempts, please try again later" });
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many password reset requests, please try again later",
    });
  },
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many payment requests, please try again later" });
  },
});

app.use(limiter);

// Body parser - webhook needs raw body for signature verification
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhookRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("[DB]", "MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("[DB ERROR]", error.message);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("[DB]", "MongoDB disconnected");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER]`, `Running on http://localhost:${PORT}`);
  console.log(
    `[ENV]`,
    `Node environment: ${process.env.NODE_ENV || "development"}`,
  );
});

export default app;
