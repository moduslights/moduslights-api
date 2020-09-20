const axios = require("axios");
const config = require("config");
const { Meter } = require("../models/meter");

const meter = async () => {
  const meters = [];

  for (let i = 0; i < 100; i++) {
    const meterNumber =
      `${Math.floor(100000 + Math.random() * 900000)}` +
      `${Math.floor(100000 + Math.random() * 900000)}`;

    const meter = {
      meterNumber,
      status: "inactive"
    };
    meters.push(meter);
  }

  Meter.collection.insert(meters, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.info(`meters were successfully stored." ${docs.length} `);
    }
  });
};

module.exports = meter;
