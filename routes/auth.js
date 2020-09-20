const Joi = require("joi");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const Email = require("../util/emial");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, name, message, phone } = req.body;

  console.log(email, name, message, phone )

  try {
    await new Email({ email, name, message, phone }).sendModusligtsInfo(name);
    res.status(200).json({
      status: "success",
      message: "Message sent to Moduslights successfully"
    });
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Something failed." + ex.message);
  }
});


function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    name: Joi.string()
      .min(5)
      .max(255)
      .required(),
    phone: Joi.string()
        .min(5)
        .max(20),
    message: Joi.string()
        .min(5)
        .max(1000)
        .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
