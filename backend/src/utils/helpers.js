import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const calculatePricing = (cards) => {
  const basePrice = cards.reduce((sum, card) => sum + (card.price || 0), 0);
  const processingFee = 0;
  const total = Math.round((basePrice + processingFee) * 100) / 100;

  return {
    basePrice,
    processingFee,
    total,
  };
};

export const formatOrderSummary = (cards, cardCount, serviceTier, pricing) => {
  const cardList = cards
    .map(
      (card) =>
        `${card.player}, ${card.year}, ${card.set} #${card.cardNumber} ($${card.price})`,
    )
    .join("\n");

  return `ORDER SUMMARY / ${new Date().toLocaleString()}
  
NUMBER OF CARDS:
${cardCount} CARDS: ${cards.length}

(OPTIONAL) CARD LIST:

${cardList}

PRICING CALCULATION:
Service Service Type: ${serviceTier}
FINAL ORDER TOTAL:
$${pricing.total.toFixed(2)} USD = $${pricing.total.toFixed(2)}`;
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
