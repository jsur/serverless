"use strict";

const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const restaurantRetryTopicArn = process.env.restaurant_retry_notification_topic;

async function retryRestaurantNotification(order) {
  const pubReq = {
    Message: JSON.stringify(order),
    TopicArn: restaurantRetryTopicArn,
  };
  await sns.publish(pubReq).promise();
  console.log(
    `order ${order.orderId}: queued restaurant notification for retry`
  );
}

module.exports = {
  restaurantNotification: retryRestaurantNotification,
};
