const winston = require("winston");
const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

require("./startup/logging");
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || 4000;
app.listen(port, () => winston.info(`App Listening on port ${port}...`));
