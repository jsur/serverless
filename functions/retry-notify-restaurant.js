"use strict";

const middy = require("middy");
const notify = require("../lib/notify");
const sampleLogging = require("../middleware/sample-logging");
const flushMetrics = require("../middleware/flush-metrics");

const handler = async function (event, context) {
  const order = JSON.parse(event.Records[0].Sns.Message); // SNS messages are delivered one at a time
  order.retried = true;

  await notify.notifyRestaurantOfOrder(order);
  return {
    statusCode: 200,
  };
};

module.exports.handler = middy(handler)
  .use(sampleLogging({ sampleRate: 0.01 }))
  .use(flushMetrics);
