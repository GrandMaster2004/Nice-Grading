import { User } from "../models/User.js";
import {
  validateRegister,
  validateLogin,
  validatePassword,
} from "../middleware/validation.js";
import { generateToken, asyncHandler } from "../utils/helpers.js";
import { createOrUpdateCustomer } from "../utils/stripe.js";
import { sendPasswordResetEmail } from "../utils/mail.js";
import crypto from "crypto";

export const register = asyncHandler(async (req, res) => {
  const { error, value } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const stripeCustomer = await createOrUpdateCustomer(value.email, value.name);

  const user = new User({
    name: value.name,
    email: value.email,
    passwordHash: value.password,
    stripeCustomerId: stripeCustomer.id,
    role: "customer",
  });

  await user.save();

  const token = generateToken(user._id, user.role);
  res.status(201).json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findOne({ email: value.email }).select(
    "+passwordHash",
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = await user.comparePassword(value.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  // Send reset email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(500).json({
      error: "Failed to send reset email. Please try again later.",
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword } = req.body;

  const { error } = validatePassword(newPassword);
  if (error) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  user.passwordHash = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  const newToken = generateToken(user._id, user.role);
  res.json({
    success: true,
    message: "Password reset successful",
    token: newToken,
    user: user.toJSON(),
  });
});
