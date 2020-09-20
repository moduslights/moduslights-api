const Joi = require("joi");
const mongoose = require("mongoose");

const BusinessUnit = mongoose.model(
  "BusinessUnit",
  new mongoose.Schema({
    merchantName: {
      type: String,
      required: true
    },
    pyamentType: {
      type: String,
      required: true
    }
  })
);

function validateBusinessUnit(businessUnit) {
  const schema = {
    merchantName: Joi.string()
      .min(5)
      .max(255)
      .required(),
    pyamentType: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(businessUnit, schema);
}

exports.BusinessUnit = BusinessUnit;
exports.validate = validateBusinessUnit;
