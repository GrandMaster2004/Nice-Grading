import Joi from "joi";

export const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(100),
  });
  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

export const validateSubmission = (data) => {
  const cardSchema = Joi.object({
    player: Joi.string().required().max(100),
    year: Joi.string().required().max(50),
    set: Joi.string().required().max(100),
    cardNumber: Joi.string().required().max(50),
    price: Joi.number().valid(5, 10, 20).required(),
    notes: Joi.string().max(500).allow(""),
  });

  const schema = Joi.object({
    cards: Joi.array().items(cardSchema).required().min(1),
    serviceTier: Joi.string()
      .valid("SPEED_DEMON", "THE_STANDARD", "BIG_MONEY")
      .required(),
    cardCount: Joi.number().required().min(1),
  });

  return schema.validate(data);
};

export const validatePassword = (password) => {
  const schema = Joi.string().required().min(6).max(100);
  return schema.validate(password);
};
