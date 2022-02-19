"use strict";

const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis();
const streamName = process.env.order_events_stream;

module.exports.handler = async function (event, context) {
  const { restaurantName, orderId, userEmail } = JSON.parse(event.body);

  log.debug(
    `restaurant [${restaurantName}] has fulfilled order ID [${orderId}] from user [${userEmail}]`
  );

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType: "order_fulfilled",
  };

  const req = {
    Data: JSON.stringify(data), // the SDK would base64 encode this for us
    PartitionKey: orderId,
    StreamName: streamName,
  };

  await kinesis.putRecord(req).promise();

  log.debug(`published 'order_fulfilled' event into Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};
