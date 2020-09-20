const express = require("express");
const users = require("../routes/users");
const customers = require("../routes/customers");
const payments = require("../routes/payments");
const auth = require("../routes/auth");
const error = require("../middleware/error");
var cors = require("cors");

module.exports = function(app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/customers", customers);
  app.use("/api/payments", payments);
  app.use(error);
};
