const config = require("config");

module.exports = function() {
  console.log(config.get("appEmail"));
  if (!config.get("jwtPrivateKey") && !config.get("payStackKey")) {
    throw new Error(
      "FATAL ERROR: jwtPrivateKey or payStackKey or both are not defined."
    );
  }
  if (!config.get("emailHost") && !config.get("emailPort")) {
    throw new Error(
      "FATAL ERROR: emailHost or emailPort or both are not defined."
    );
  }
  if (!config.get("appEmail") && !config.get("appEmailPassword")) {
    throw new Error(
      "FATAL ERROR: appEmail or appEmailPassword or both are not defined."
    );
  }
};
