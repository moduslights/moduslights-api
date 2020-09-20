const { Payment, validate } = require("../models/payment");
const { Customer } = require("../models/customer");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const paystack = require("../controllers/PaystackController");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const winston = require("winston");

Fawn.init(mongoose);
const PING_CHARGE = 200;

router.get("/", auth, async (req, res) => {
  //find all payment by a customer
  const user = await User.findById(req.user._id);
  const customer = await Customer.findOne({ userId: user._id }).exec();

  if (!customer) {
    return res.send([]);
  }

  const payments = await Payment.find({ customerId: customer._id }).sort(
    "-pyamentDate"
  );

  const formatedPayments = payments.map(payment =>
    _.pick(payment, [
      "_id",
      "customerId",
      "amount",
      "pyamentDate",
      "status",
      "reference",
      "transactionName"
    ])
  );
  res.send(formatedPayments);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id).exec();
  if (!user) return res.status(400).send("User is not registered.");

  const customer = await Customer.findOne({ userId: req.user._id });

  if (!customer) {
    return res
      .status(400)
      .send(
        "Customer is required to register with Merchant before making payment."
      );
  }

  //subtract the ping charge that was added from  the UI, the remaing amount will
  // be the ping charge and the actual amount going to merchant
  const amount = req.body.amount - PING_CHARGE;

  let payment = new Payment({
    customerId: customer._id,
    amount: amount,
    pingCharge: PING_CHARGE,
    pyamentDate: Date.now(),
    transactionName: req.body.transactionName
  });

  const card = {
    number: req.body.number,
    cvv: req.body.cvv,
    expiry_month: req.body.expiry_month,
    expiry_year: req.body.expiry_year
  };

  // const card = {
  //   number: "4084084084084081",
  //   cvv: "408",
  //   expiry_month: "01",
  //   expiry_year: "2020"
  // };
  //update the payment with the status return from paystack

  try {
    const response = await paystack(payment, card, user.email);

    const { data, status } = response.data;
    const { reference, amount, channel, fees } = data;
    console.log("reference", reference);
    console.log("amount", amount);
    console.log("channel", channel);
    console.log("fees", fees);
    console.log("status", status);

    if (status) {
      payment.status = "Completed";
      payment.payStackCharge = fees;
      payment.amount = amount;
      payment.reference = reference;
    }
    const newPayment = new Payment(payment);
    const savedPayment = await newPayment.save();

    winston.info("Payment was successfully posted ID " + `${savedPayment._id}`);

    res.send(
      _.pick(savedPayment, [
        "_id",
        "customerId",
        "amount",
        "pyamentDate",
        "status",
        "reference",
        "transactionName"
      ])
    );
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Something failed." + ex.message);
  }
});

router.get("/:id", auth, async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment)
    return res.status(404).send("The payment with the given ID was not found.");

  res.send(
    _.pick(payment, [
      "_id",
      "customerId",
      "amount",
      "pyamentDate",
      "status",
      "reference",
      "transactionName"
    ])
  );
});

module.exports = router;
