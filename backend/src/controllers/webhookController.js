import { Payment } from "../models/Payment.js";
import { Submission } from "../models/Submission.js";
import { asyncHandler } from "../utils/helpers.js";
import { verifyWebhookSignature } from "../utils/stripe.js";

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = verifyWebhookSignature(
      signature,
      req.rawBody || req.body,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[WEBHOOK VERIFICATION ERROR]", error.message);
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" });
  }

  console.log("[WEBHOOK EVENT]", {
    type: event.type,
    timestamp: new Date().toISOString(),
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const payment = await Payment.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (payment) {
          payment.status = "succeeded";
          await payment.save();
        }

        const submission = await Submission.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (submission) {
          submission.paymentStatus = "paid";
          await submission.save();
        }

        console.log("[PAYMENT SUCCEEDED]", {
          paymentIntentId: paymentIntent.id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        const payment = await Payment.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (payment) {
          payment.status = "failed";
          payment.errorMessage =
            paymentIntent.last_payment_error?.message || "Unknown error";
          await payment.save();
        }

        const submission = await Submission.findOne({
          stripePaymentIntentId: paymentIntent.id,
        });

        if (submission) {
          submission.paymentStatus = "failed";
          await submission.save();
        }

        console.log("[PAYMENT FAILED]", {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        break;
      }

      case "setup_intent.succeeded": {
        const setupIntent = event.data.object;
        console.log("[SETUP INTENT SUCCEEDED]", {
          setupIntentId: setupIntent.id,
        });
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object;

        const payment = new Payment({
          stripeChargeId: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          status: "succeeded",
        });

        await payment.save();

        console.log("[CHARGE SUCCEEDED]", { chargeId: charge.id });
        break;
      }

      default:
        console.log("[UNHANDLED WEBHOOK]", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK PROCESSING ERROR]", {
      eventType: event.type,
      error: error.message,
    });
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
