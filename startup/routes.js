const express = require("express");
const auth = require("../routes/auth");
const error = require("../middleware/error");
var cors = require("cors");

module.exports = function(app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/message", auth);
  app.use(error);
};
