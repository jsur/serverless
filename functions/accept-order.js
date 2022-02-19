"use strict";

const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis();
const streamName = process.env.order_events_stream;

module.exports.handler = async function (event, context, cb) {
  const { restaurantName, orderId, userEmail } = JSON.parse(event.body);
  /* const restaurantName = body.restaurantName;
  const orderId = body.orderId;
  const userEmail = body.userEmail;
  */

  log.debug(
    `restaurant [${restaurantName}] accepted order ID [${orderId}] from user [${userEmail}]`
  );

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType: "order_accepted",
  };

  const req = {
    Data: JSON.stringify(data), // the SDK would base64 encode this for us
    PartitionKey: orderId,
    StreamName: streamName,
  };

  await kinesis.putRecord(req).promise();

  log.debug(`published 'order_accepted' event into Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};
