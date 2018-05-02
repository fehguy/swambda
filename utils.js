"use strict";

global.respondWith = function (resolve, code, body) {
  const response = {
    statusCode: code,
    headers: {}
  };
  if(global.extraHeaders) {
    Object.keys(extraHeaders).forEach((key) => {
      response.headers[key] = global.extraHeaders[key];
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
  if(global.responseInterceptor && typeof global.responseInterceptor === "function") {
    global.responseInterceptor(response)
      .then((res) => {
        resolve(res);
      }
    )
  }
  else {
    resolve(response);
  }
};
