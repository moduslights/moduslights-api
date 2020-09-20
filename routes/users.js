const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { Meter } = require("../models/meter");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const winston = require("winston");
const multer = require("multer");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});
router.get("/name", async (req, res) => {
  res.send({ name: "Babatunde" });
});

router.get("/", auth, async (req, res) => {
  const users = await User.find().select("-password");
  winston.info("getting all users ....");
  res.send(users);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email }).exec();
  if (user) {
    winston.info("User already registered.");
    return res.status(400).send("Email already registered.");
  }

  //make sure the meter number is not already registered
  const meter = await Meter.findOne({
    meterNumber: req.body.userCode,
    status: "inactive"
  }).exec();

  if (!meter)
    return res
      .status(400)
      .send(`Invalid user registration code : ${req.body.userCode}`);

  try {
    user = new User(
      _.pick(req.body, ["name", "email", "password", "userCode"])
    );
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    const formattedUser = _.pick(user, ["_id", "name", "email", "userCode"]);
    formattedUser["token"] = token;

    //update the meter to active once a user has registered with the number
    const meter = await Meter.findOneAndUpdate(
      { meterNumber: req.body.userCode },
      { $set: { status: "active" } },
      { new: true }
    ).exec();

    winston.info("Meter updated successfully. ID: ", meter._id);

    return res.header({ "x-auth-token": token }).send(formattedUser);
  } catch (error) {
    winston.info("Internal server Error.", error.message);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

router.patch("/updateMe", auth, async (req, res) => {});

module.exports = router;
