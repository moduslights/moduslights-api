const { Customer, validate } = require("../models/customer");
const { User } = require("../models/user");
const { Meter } = require("../models/meter");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const meter = require("../controllers/MeterController");

router.get("/", auth, async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userId = req.user;

  let customer = await Customer.findOne({
    userId: userId
  });

  if (customer) return res.send(customer);

  const meter = await Meter.findOne({ meterNumber: req.body.meterNumber });

  if (!meter)
    return res
      .status(400)
      .send(`Invalid meter number ${$req.body.meterNumber}`);

  const meterFound = await Customer.findOne({
    meterNumber: req.body.meterNumber
  });

  if (meterFound)
    return res
      .status(400)
      .send(
        `An account with the meter number : ${meterFound.meterNumber} exists`
      );

  let newCustomer = new Customer({
    meterNumber: req.body.meterNumber,
    meterType: req.body.meterType,
    phone: req.body.phone,
    userId
  });
  newCustomer = await newCustomer.save();
  console.log(newCustomer);
  res.send(newCustomer);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      meterNumber: req.body.meterNumber,
      meterType: req.body.meterType,
      phone: req.body.phone,
      userId: req.body.userId
    },
    { new: true }
  );

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.delete("/:id", auth, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.get("/:userId", auth, async (req, res) => {
  const userId = req.params.userId;
  console.log("userId", userId);
  if (!userId)
    return res.status(400).send("User Id is required to retrieve the customer");
  const customer = await Customer.find({ userId }).exec();

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer[0]);
});

module.exports = router;
