"use strict";

const getRecords = require("../lib/kinesis").getRecords;
const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis();
const sns = new AWS.SNS();
const streamName = process.env.order_events_stream;
const topicArn = process.env.user_notification_topic;

module.exports.handler = async function (event, context) {
  const records = getRecords(event);
  const orderAccepted = records.filter((r) => r.eventType === "order_accepted");

  for await (let order of orderAccepted) {
    const snsReq = {
      Message: JSON.stringify(order),
      TopicArn: topicArn,
    };
    await sns.publish(snsReq).promise();
    log.debug(
      `notified user [${order.userEmail}] of order [${order.orderId}] being accepted`
    );

    const kinesisReq = {
      Data: JSON.stringify({
        ...order,
        eventType: "user_notified",
      }), // the SDK would base64 encode this for us
      PartitionKey: order.orderId,
      StreamName: streamName,
    };
    await kinesis.putRecord(kinesisReq).promise();
    log.debug(`published 'user_notified' event to Kinesis`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "OK" }),
  };
};
