"use strict";

const middy = require("middy");
const { getRecords } = require("../lib/kinesis");
const { notifyRestaurantOfOrder } = require("../lib/notify");
const retry = require("../lib/retry");
const sampleLogging = require("../middleware/sample-logging");
const flushMetrics = require("../middleware/flush-metrics");

const handler = async function (event, context) {
  const records = getRecords(event);
  const orderPlaced = records.filter((r) => r.eventType === "order_placed");

  for await (let order of orderPlaced) {
    try {
      await notifyRestaurantOfOrder(order);
    } catch (e) {
      retry.restaurantNotification(order);
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "OK" }),
  };
};

module.exports.handler = middy(handler)
  .use(sampleLogging({ sampleRate: 0.01 }))
  .use(flushMetrics);
