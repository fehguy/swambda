"use strict";

global.respondWith = function (resolve, code, body) {
  const response = {
    statusCode: code,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Allow": "OPTIONS,HEAD,DELETE,POST,GET",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT",
      "Access-Control-Allow-Headers": "Content-Type, api_key, Authorization"
    }
  };

  if(typeof body !== "undefined") {
    if(typeof body === "object") {
      response.body = JSON.stringify(body, null, 2);
      response.headers["Content-Type"] = "application/json";
    }
    else {
      response.body = body;
    }
  }
  else {
    response.body = "";
  }
  resolve(response);
};
