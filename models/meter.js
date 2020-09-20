const mongoose = require("mongoose");

const Meter = mongoose.model(
  "Meter",
  new mongoose.Schema({
    meterNumber: {
      type: String,
      required: true,
      minlength: 12,
      maxlength: 12
    },
    status: {
      type: String,
      required: true,
      default: "inactive"
    }
  })
);

// function validateCustomer(customer) {
//   const schema = {
//     meterNumber: Joi.string()
//       .min(5)
//       .max(50)
//       .required()
//   };

//   return Joi.validate(customer, schema);
// }

exports.Meter = Meter;
//exports.validate = validateCustomer;
