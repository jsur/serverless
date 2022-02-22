"use strict";

const xray = require("aws-xray-sdk");
const AWS = xray.captureAWS(require("aws-sdk"));
const sns = new AWS.SNS();
const restaurantRetryTopicArn = process.env.restaurant_retry_notification_topic;
const cloudwatch = require("../lib/cloudwatch");

async function retryRestaurantNotification(order) {
  const pubReq = {
    Message: JSON.stringify(order),
    TopicArn: restaurantRetryTopicArn,
  };
  cloudwatch.trackExecTime("SnsPublishLatency", async () => {
    await sns.publish(pubReq).promise();
  });
  console.log(
    `order ${order.orderId}: queued restaurant notification for retry`
  );

  cloudwatch.incrCount("NotifyRestaurantQueued");
}

module.exports = {
  restaurantNotification: retryRestaurantNotification,
};
