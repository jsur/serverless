"use strict";

const fs = require("fs").promises;
const mustache = require("mustache");
const http = require("superagent");
const aws4 = require("aws4");
const URL = require("url");

const restaurantsApiRoot = process.env.restaurants_api;
const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

var html; // lambda reuses cached global vars

function loadHtml() {
  if (!html) {
    html = fs.readFile("static/index.html", "utf-8");
  }
  return html;
}

async function getRestaurants() {
  const url = URL.parse(restaurantsApiRoot);
  const opts = aws4.sign({
    host: url.hostname,
    path: url.pathname,
  });
  const { body } = await http
    .get(restaurantsApiRoot)
    .set("Host", opts.headers["Host"])
    .set("X-Amz-Date", opts.headers["X-Amz-Date"])
    .set("Authorization", opts.headers["Authorization"])
    .set("X-Amz-Security-Token", opts.headers["X-Amz-Security-Token"]);
  return body;
}

module.exports.handler = async (event) => {
  const page = await loadHtml();
  const restaurants = await getRestaurants();
  const dayOfWeek = days[new Date().getDay()];
  const view = {
    restaurants,
    dayOfWeek,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`,
  };
  const rendered = mustache.render(page, view);

  return {
    statusCode: 200,
    body: rendered,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
    },
  };
};
