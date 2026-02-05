import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const calculatePricing = (cardCount, serviceTier) => {
  let basePrice = 0;

  switch (serviceTier) {
    case "SPEED_DEMON":
      basePrice = 289;
      break;
    case "THE_STANDARD":
      basePrice = 49;
      break;
    case "BIG_MONEY":
      basePrice = 69;
      break;
    default:
      throw new Error("Invalid service tier");
  }

  const processingFee = Math.round(basePrice * 0.05 * 100) / 100;
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
      (card) => `${card.player}, ${card.year}, ${card.set} #${card.cardNumber}`,
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
