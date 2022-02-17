"use strict";

const fs = require("fs").promises;

var html; // lambda reuses cached global vars

function loadHtml() {
  if (!html) {
    html = fs.readFile("static/index.html", "utf-8");
  }
  return html;
}

module.exports.handler = async (event) => {
  let page = await loadHtml();
  return {
    statusCode: 200,
    body: page,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
    },
  };
};
