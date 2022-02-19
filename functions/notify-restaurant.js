"use strict";

const { getRecords } = require("../lib/kinesis");
const { notifyRestaurantOfOrder } = require("../lib/notify");
const retry = require("../lib/retry");

module.exports.handler = async function (event, context) {
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
