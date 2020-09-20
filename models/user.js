const config = require("config");
const jwt = require("jsonwebtoken");
const { Customer } = require("./customer");
const Joi = require("joi");
const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  userCode: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  active: {
    type: Boolean,
    default: false
  },
  isAdmin: Boolean,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      name: this.name,
      email: this.email
    },
    config.get("jwtPrivateKey"),
    {
      expiresIn: "1h"
    }
  );
  return token;
};

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  // expire in 10 minutes : 10 x 60secons x 1000 to convert to milliseconds
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.post("remove", async (user, next) => {
  await Customer.remove({ userId: user._id }).exec();
  next();
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    userCode: Joi.string()
      .min(5)
      .max(50)
      .required(),
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

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
