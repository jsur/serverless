"use strict";

const AWS = require("aws-sdk");
const kinesis = new AWS.Kinesis();
const sns = new AWS.SNS();
const cloudwatch = require("./cloudwatch");
const streamName = process.env.order_events_stream;
const restaurantTopicArn = process.env.restaurant_notification_topic;

async function notifyRestaurantOfOrder(order) {
  try {
    const pubReq = {
      Message: JSON.stringify(order),
      TopicArn: restaurantTopicArn,
    };
    cloudwatch.trackExecTime("SnsPublishLatency", async () => {
      await sns.publish(pubReq).promise();
    });
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
    cloudwatch.trackExecTime("KinesisPutRecordLatency", async () => {
      await kinesis.putRecord(putRecordReq).promise();
    });

    cloudwatch.incrCount("NotifyRestaurantSuccess");
  } catch (e) {
    cloudwatch.incrCount("NotifyRestaurantFailure");
    throw e;
  }
}

module.exports = {
  notifyRestaurantOfOrder,
};
