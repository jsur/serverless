"use strict";

const correlationIds = require("../lib/correlation-ids");

module.exports = (config) => {
  let oldLogLevel;

  const isDebugEnabled = () => {
    const context = correlationIds.get();
    if (context["Debug-Log-Enabled"] === "true") {
      return true;
    }

    return config.sampleRate && Math.random() <= config.sampleRate;
  };

  return {
    before: (handler, next) => {
      if (isDebugEnabled()) {
        oldLogLevel = process.env.log_level;
        process.env.log_level = "DEBUG";
      }
      next();
    },
    after: (handler, next) => {
      if (oldLogLevel) {
        process.env.log_level = oldLogLevel;
      }
      next();
    },
  };
};
