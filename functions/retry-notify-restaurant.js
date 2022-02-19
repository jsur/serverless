"use strict";

const notify = require("../lib/notify");

module.exports.handler = async function (event, context) {
  const order = JSON.parse(event.Records[0].Sns.Message); // SNS messages are delivered one at a time
  order.retried = true;

  await notify.notifyRestaurantOfOrder(order);
  return {
    statusCode: 200,
  };
};
