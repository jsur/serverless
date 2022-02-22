"use strict";

const xray = require("aws-xray-sdk");
const AWS = xray.captureAWS(require("aws-sdk"));
const dynamodb = new AWS.DynamoDB.DocumentClient();

const { defaultResults, restaurants_table } = process.env;

async function findRestaurantsByTheme(theme, count) {
  const req = {
    TableName: restaurants_table,
    Limit: count,
    FilterExpression: "contains(themes, :theme)",
    ExpressionAttributeValues: { ":theme": theme },
  };
  const res = await dynamodb.scan(req).promise();
  return res.Items;
}

module.exports.handler = async (event, ctx) => {
  const req = JSON.parse(event.body);
  const restaurants = await findRestaurantsByTheme(req.theme, defaultResults);
  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
  return response;
};
