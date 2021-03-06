"use strict";

function parsePayload(record) {
  const json = Buffer.from(record.kinesis.data, "base64").toString("utf-8");
  return JSON.parse(json);
}

function getRecords(event) {
  return event.Records.map(parsePayload);
}

module.exports = {
  getRecords,
};
