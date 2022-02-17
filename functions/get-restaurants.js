"use strict";

const AWS = require("aws-sdk");
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

module.exports.handler = async (event, ctx) => {
  const restaurants = await getRestaurants(defaultResults || 8);
  const response = {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
  return response;
};
