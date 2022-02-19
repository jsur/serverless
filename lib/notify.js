"use strict";

const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis();
const sns = new AWS.SNS();
const streamName = process.env.order_events_stream;
const restaurantTopicArn = process.env.restaurant_notification_topic;

async function notifyRestaurantOfOrder(order) {
  const pubReq = {
    Message: JSON.stringify(order),
    TopicArn: restaurantTopicArn,
  };
  await sns.publish(pubReq).promise();
  console.log(
    `notified restaurant ${order.restaurantName} of order ${order.orderId}`
  );
  const putRecordReq = {
    Data: JSON.stringify({
      ...order,
      eventType: "restaurant_notified",
    }),
    PartitionKey: order.orderId,
    StreamName: streamName,
  };
  await kinesis.putRecord(putRecordReq).promise();
}

module.exports = {
  notifyRestaurantOfOrder,
};
