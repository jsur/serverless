"use strict";

const cloudwatch = require("../lib/cloudwatch");

module.exports = {
  after: (handler, next) => {
    cloudwatch.flush().then(() => next());
  },
  onError: (handler, next) => {
    cloudwatch.flush().then(() => next(handler.error));
  },
};
