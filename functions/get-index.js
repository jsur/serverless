"use strict";

const fs = require("fs").promises;
const mustache = require("mustache");
const http = require("superagent");
const aws4 = require("aws4");
const URL = require("url");
const log = require("../lib/log");

const restaurantsApiRoot = process.env.restaurants_api;
const ordersApiRoot = process.env.orders_api;
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

// return html just to demonstrate that lambdas can return other formats than json
// e.g. protocol buffers
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

  const httpReq = http
    .get(restaurantsApiRoot)
    .set("Host", opts.headers["Host"])
    .set("X-Amz-Date", opts.headers["X-Amz-Date"])
    .set("Authorization", opts.headers["Authorization"]);

  if (opts.headers["X-Amz-Security-Token"]) {
    httpReq.set("X-Amz-Security-Token", opts.headers["X-Amz-Security-Token"]);
  }

  const { body } = await httpReq;
  return body;
}

module.exports.handler = async (event) => {
  const page = await loadHtml();
  log.debug("Loaded html template");
  const restaurants = await getRestaurants();
  log.debug("Loaded restaurants");
  const dayOfWeek = days[new Date().getDay()];
  const view = {
    restaurants,
    dayOfWeek,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`,
    placeOrderUrl: `${ordersApiRoot}/`,
  };
  const rendered = mustache.render(page, view);
  log.debug(`Generated html [${rendered.length} bytes]`);

  return {
    statusCode: 200,
    body: rendered,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
    },
  };
};
