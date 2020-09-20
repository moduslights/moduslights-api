const Joi = require("joi");
const mongoose = require("mongoose");

const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true
    },
    transactionName: {
      type: String,
      required: true,
      default: "Electricity - IKEDC"
    },
    amount: {
      type: Number,
      min: 0
    },
    pingCharge: {
      type: Number,
      min: 0
    },
    payStackCharge: {
      type: Number,
      min: 0
    },
    pyamentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      required: true,
      default: "Pending"
    },
    reference: {
      type: String,
      required: true,
      default: "ref"
    }
  })
);

function validatePyament(payment) {
  const schema = {
    amount: Joi.number()
      .min(0)
      .required(),
    number: Joi.string()
      .min(16)
      .max(16)
      .required(),
    cvv: Joi.string()
      .min(3)
      .max(3)
      .required(),
    expiry_year: Joi.string()
      .min(4)
      .max(4)
      .required(),
    expiry_month: Joi.string()
      .min(2)
      .max(2)
      .required(),
    transactionName: Joi.string()
      .min(3)
      .max(100)
      .required()
  };

  return Joi.validate(payment, schema);
}

exports.Payment = Payment;
exports.validate = validatePyament;
