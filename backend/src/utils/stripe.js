import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, customerId) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    customer: customerId,
  });
  return paymentIntent;
};

export const confirmPaymentIntent = async (
  paymentIntentId,
  paymentMethodId,
) => {
  const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
  return confirmed;
};

export const createSetupIntent = async (customerId) => {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });
  return setupIntent;
};

export const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export const createOrUpdateCustomer = async (email, name) => {
  const customers = await stripe.customers.search({
    query: `email:"${email}"`,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  return await stripe.customers.create({
    email,
    name,
  });
};

export const chargeCustomer = async (customerId, amount, paymentMethodId) => {
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customerId,
    amount: Math.round(amount * 100),
    currency: "usd",
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });
  return paymentIntent;
};

export const verifyWebhookSignature = (signature, body, secret) => {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export { stripe };
