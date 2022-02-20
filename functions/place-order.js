"use strict";

const AWS = require("aws-sdk");
const chance = require("chance").Chance();
const kinesis = new AWS.Kinesis();
const log = require("../lib/log");
const streamName = process.env.order_events_stream;
const eventType = "order_placed";

module.exports.handler = async function (event, context) {
  const { restaurantName } = JSON.parse(event.body);
  const userEmail = event.requestContext.authorizer.claims.email;
  const orderId = chance.guid();
  log.debug(
    `placing order id ${orderId} to ${restaurantName} from user ${userEmail}`
  );

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType,
  };

  const putReq = {
    Data: JSON.stringify(data),
    PartitionKey: orderId,
    StreamName: streamName,
  };

  await kinesis.putRecord(putReq).promise();

  log.debug(`published ${eventType} event to Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};
