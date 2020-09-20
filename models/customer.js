const Joi = require("joi");
const mongoose = require("mongoose");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    meterNumber: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    meterType: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    phone: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  })
);

function validateCustomer(customer) {
  const schema = {
    meterNumber: Joi.string()
      .min(5)
      .max(50)
      .required(),
    phone: Joi.string()
      .min(5)
      .max(50)
      .required(),
    meterType: Joi.string()
      .min(5)
      .max(50)
      .required()
  };

  return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
