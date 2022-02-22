"use strict";

const xray = require("aws-xray-sdk");
const AWS = xray.captureAWS(require("aws-sdk"));
const middy = require("middy");
const correlationIds = require("../middleware/capture-correlation-ids");
const sampleLogging = require("../middleware/sample-logging");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const { defaultResults, restaurants_table } = process.env;

async function getRestaurants(count) {
  const req = {
    TableName: restaurants_table,
    Limit: count,
  };
  const res = await dynamodb.scan(req).promise();
  return res.Items;
}

const handler = async (event, ctx) => {
  const restaurants = await getRestaurants(defaultResults || 8);
  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
  return response;
};

module.exports.handler = middy(handler).use(
  correlationIds({ sampleDebugLogRate: 0.01 }).use(
    sampleLogging({ sampleRate: 0.01 })
  )
);
