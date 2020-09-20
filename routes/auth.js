const Joi = require("joi");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const winston = require("winston");
const Email = require("../util/emial");
const config = require("config");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  const token = user.generateAuthToken();
  res.send(token);
});

router.post("/forgotPassword", async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).exec();
  if (!user) {
    const errorMessage = `There is no user with the email address ${
      req.body.email
    }`;
    winston.info(errorMessage);
    return res.status(404).send(errorMessage);
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${config.get(
    "clientAppBaseUrl"
  )}/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
    //await new Email(user, resetURL).sendWelcome();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!"
    });
  } catch (ex) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(ex);
    res.status(500).send("Something failed." + ex.message);
  }
});

router.patch("/resetPassword/:token", async (req, res) => {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).send("Token is invalid or has expired");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  return res.status(200).send("Password reset successfully");
});

function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
