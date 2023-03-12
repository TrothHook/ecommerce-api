// eslint-disable-next-line import/no-extraneous-dependencies
const stripePay = require("stripe");

const CreateError = require("../utils/createError");

const stripe = stripePay(process.env.STRIPE_KEY);

exports.payment = async (req, res, next) => {
  stripe.charges.create(
    {
      source: req.body.tokenID,
      amount: req.body.amount,
      currency: "usd"
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) return next(new CreateError(`${stripeErr.message}`, 500));
      res.status(200).json({
        status: "success",
        stripe: stripeRes
      });
    }
  );
};
