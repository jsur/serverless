"use strict";

module.exports = (config) => {
  let oldLogLevel;
  return {
    before: (handler, next) => {
      if (config.sampleRate && Math.random() <= config.sampleRate) {
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
