"use strict";

const SwaggerParser = require("swagger-parser");
const Router = require("swagger-router").Router;
const utils = require("./utils");
let container = {};

module.exports.cacheWith = (cache) => {
  const existing = container;
  utils.cacheWith(cache);
  container = cache;

  if(existing.requestInterceptor) {
    container.requestInterceptor;
  }
  if(existing.responseInterceptor) {
    container.responseInterceptor;
  }
  container.Swambda = Swambda;
  container.respondWith = utils.respondWith;
};

module.exports.fromCache = () => {
  return new Promise((resolve, reject) => {
    if(container.router) {
      resolve(container.router);
    }
    else {
      reject();
    }
  });
};

module.exports.cache = (router) => {
  if(container) {
    container.router = router;
  }
};

const Swambda = class Swambda {
  constructor(prefix) {
    this.prefix = prefix;
    container.respondWith = utils.respondWith;

    container.requestInterceptor = function (event, args) {
      return new Promise((resolve, reject) => {
        resolve(args);
      });
    }

    container.responseInterceptor = function (response) {
      return new Promise((resolve, reject) => {
        resolve (response);
      })
    }
    return this;
  }
}

Swambda.prototype.spec = function (specLocator) {
  this.specLocator = specLocator;
  return this;
};

Swambda.prototype.pathPrefix = function (prefix) {
  this.prefix = prefix;
  return this;
};

Swambda.prototype.preProcessor = function (preProcessor) {
  container.requestInterceptor = preProcessor;
  return this;
}

Swambda.prototype.postProcessor = function (postProcessor) {
  container.responseInterceptor = postProcessor;
  return this;
}

Swambda.prototype.cors = function (extra) {
  const headers = extra || {};
  if(!headers["Access-Control-Allow-Origin"]) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  if(!headers["Allow"]) {
    headers["Allow"] = "OPTIONS,HEAD,DELETE,POST,GET";
  }
  if(!headers["Access-Control-Allow-Methods"]) {
    headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, PUT";
  }
  if(!headers["Access-Control-Allow-Headers"]) {
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }
  container.extraHeaders = extra || {};
  return this;
}

Swambda.prototype.load = function (identifier) {
  return new Promise((resolve, reject) => {
    if(container.router) {
      resolve(container.router);
      return;
    }
    let path;
    if(typeof identifier === "object") {
      this.spec = identifier;
      path = undefined;
    }
    else {
      this.spec = require(identifier);
    }

    const self = this;
    SwaggerParser.validate(this.spec)
      .then(api => {
        let moduleName = this.prefix.substring(this.prefix.indexOf("/.netlify/functions/"))
          .substring("/.netlify/functions/".length).split("/")[0];

        if(self.prefix.startsWith("/" + moduleName)) {
          api.basePath = "/" + moduleName + "/.netlify/functions/" + moduleName;
        }
        else {
          api.basePath = "/.netlify/functions/" + moduleName;
        }

        const router = new Router();
        router.setTree(router.specToTree(api));
        self.router = router;

        container.router = self;
        resolve(self);
      });
  });
}

Swambda.prototype.process = function (event) {
  return new Promise((resolve, reject) => {
    const path = event.path.substring(this.spec.basePath.length);
    const httpMethod = event.httpMethod.toLowerCase();
    if(httpMethod === "options") {
      container.respondWith(resolve, 200, "");
      return;
    }
    if(!path) {
      container.respondWith(resolve, 404, {
        statusCode: 404,
        body: {
          code: 404,
          message: "invalid path"
        }});
        return;
    }
    if(path === "/swagger.json") {
      container.respondWith(resolve, 200, this.spec);
      return;
    }
    const route = this.router.lookup(path);
    if(!route) {
      container.respondWith(resolve, 404, {
        code: 404,
        message: "path " + path + " not found"
      });
      return;
    }
    const operation = route.value[httpMethod];
    if(!operation) {
      container.respondWith(resolve, 404, {
        code: 404,
        message: "operation `" + httpMethod + "` not found"
      });
      return;
    }

    const params = {};
    const args = {};
    const controller = operation["x-swagger-router-controller"];
    if(!controller) {
      container.respondWith(resolve, 404, {
        code: 404,
        message: "controller `" + controller + "` not found"
      });
      return;
    }
    const operationId = operation.operationId;
    if(!operationId) {
      container.respondWith(resolve, 404, {
        statusCode: 404,
        body: {
          code: 404,
          message: "operationId `" + operationId + "` not found"
        }});
        return;
    }
    (operation.parameters || [])
      .map((param) => {
        if(param.in === "path") {
          const value = extractValue(param, route.params);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        if(param.in === "body") {
          const value = parseBody(event.headers, event.body);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        if(param.in === "query") {
          const value = extractValue(param, event.queryStringParameters);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        if(param.in === "header") {
          const value = extractValue(param, event.headers);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        params[param.name] = param;
    });

    let cls;
    try {
      const classname = "" + controller;
      cls = require(`../../controllers/${controller}`);
    }
    catch(e) {
      container.respondWith(resolve, 400, {
        code: 400,
        message: "class " + controller + " not found"
      });
      return;
    }
    if(!cls || typeof cls[operationId] !== "function") {
      container.respondWith(resolve, 404, {
        code: 404,
        message: "operation not found"
      });
      return;
    }

    container.requestInterceptor(event, args)
      .then((result) => {
        cls[operationId](args)
          .then(response => {
            resolve(response);
          })
          .catch(err => {
            container.respondWith(resolve, 500, {
              statusCode: 500,
              body: {
                code: 500,
                message: "bad operation"
              }});
          });
      });
  })
}

module.exports.prettyPrint = (error, value) => {
  console.log(JSON.stringify(value, null, 2));
}

const parseBody = (headers, body) => {
  if(typeof body === "undefined") {
    return;
  }
  if(headers && headers["content-type"]) {
    try {
      return JSON.parse(body);
    }
    catch(e) {
      return body;
    }
  }
}

const extractValue = (param, source) => {
  const value = source[param.name];
  if(!value) {
    return;
  }
  switch(param.type) {
    case "integer":
      const result = parseInt(value);
      return isNaN(result) ? undefined : result;
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}
