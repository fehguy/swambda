"use strict";

let container = {};

module.exports.cacheWith = (cache) => {
  const existing = container;
  container = cache;

  if(existing.responseInterceptor) {
    container.responseInterceptor = existing.responseInterceptor;
  }
  if(existing.extraHeaders) {
    container.extraHeaders = existing.extraHeaders;
  }
};

module.exports.respondWith = function (resolve, code, body) {
  const response = {
    statusCode: code,
    headers: {}
  };
  if(container.extraHeaders) {
    Object.keys(container.extraHeaders).forEach((key) => {
      response.headers[key] = container.extraHeaders[key];
    });
  }

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
  if(container.responseInterceptor && typeof container.responseInterceptor === "function") {
    container.responseInterceptor(response)
      .then((res) => {
        resolve(res);
      }
    );
  }
  else {
    resolve(response);
  }
};
