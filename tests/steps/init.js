"use strict";

const { promisify } = require("util");
const co = require("co");
const awscred = require("awscred");
const loadCredentials = promisify(awscred.loadCredentials);

let initialized = false;

const init = co.wrap(function* () {
  if (initialized) return;

  process.env.restaurants_api =
    "https://v9fq4dtkq8.execute-api.us-east-1.amazonaws.com/dev/restaurants";
  process.env.restaurants_table = "restaurants";
  process.env.AWS_REGION = "us-east-1";
  process.env.cognito_user_pool_id = "test_cognito_user_pool_id";
  process.env.cognito_client_id = "test_cognito_client_id";

  const cred = yield loadCredentials();

  process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;

  console.log(cred);

  initialized = true;
});

module.exports = {
  init,
};
