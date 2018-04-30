"use strict";

global.respondWith = function (resolve, code, body) {
  const response = {
    statusCode: code,
    body: JSON.stringify(body, null, 2)
  };

  resolve(response);
};
