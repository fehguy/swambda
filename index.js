"use strict";

const Swagger = require("swagger-client");
const Router = require("swagger-router").Router;
const params = require("./src/params");
const jsYaml = require("js-yaml");
const utils = require("./src/utils");

let container = {
  controllers: "./controllers"
};

module.exports.cacheWith = (cache) => {
  const existing = container;
  utils.cacheWith(cache);
  container = cache;

  if(existing.controllers) {
    container.controllers = existing.controllers;
  }
  if(existing.requestInterceptor) {
    container.requestInterceptor = existing.requestInterceptor;
  }
  if(existing.responseInterceptor) {
    container.responseInterceptor = existing.responseInterceptor;
  }
  if(existing.extraHeaders) {
    container.extraHeaders = existing.extraHeaders;
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

const Swambda = module.exports.Swambda = class Swambda {
  constructor(prefix) {
    this.prefix = prefix;
    container.respondWith = utils.respondWith;

    container.requestInterceptor = function (event, args) {
      return new Promise((resolve, reject) => {
        resolve(args);
      });
    };

    container.responseInterceptor = function (response) {
      return new Promise((resolve, reject) => {
        resolve (response);
      });
    };
    return this;
  }
};

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
};

Swambda.prototype.postProcessor = function (postProcessor) {
  container.responseInterceptor = postProcessor;
  return this;
};

Swambda.prototype.controllerDir = function (controllerDir) {
  container.controllers = controllerDir;
  return this;
};

Swambda.prototype.cors = function (extra) {
  const headers = extra || {};
  if(!headers["Access-Control-Allow-Origin"]) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  if(!headers["Access-Control-Allow-Methods"]) {
    headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, PUT, OPTIONS";
  }
  if(!headers["Access-Control-Allow-Headers"]) {
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }
  container.extraHeaders = headers;
  return this;
};

Swambda.prototype.load = function (identifier) {
  return new Promise((resolve, reject) => {
    if(container.router) {
      resolve(container.router);
      return;
    }
    const self = this;

    resolveSpec(identifier)
      .then(res => {
        self.spec = res.spec;
        self.spec.basePath = this.prefix;

        self.routePaths = compilePaths(self.spec.paths);

        const router = new Router();
        router.setTree(router.specToTree(self.spec));
        self.router = router;

        container.router = self;
        resolve(self);
      })
      .catch((err) => {
        reject(err);
      })
  });
};

var compilePaths = function(paths) {
  const pathNames = Object.keys(paths);
  const parts = [];
  pathNames.forEach((v) => {
    parts.push({
      path: v,
      parts: v.split("/"),
      operation: paths[v]
    });
  })
  return parts;
}

var resolveSpec = function (identifier) {
  // passed a spec object
  return new Promise((resolve, reject) => {
    if(typeof identifier === "object") {
      Swagger.resolve({
        spec: identifier,
        allowMetaPatches: false
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err)
      });
      return;
    }
    // passed a URL
    if(identifier.indexOf("http://") === 0 || identifier.indexOf("https://") === 0) {
      Swagger.resolve({
        allowMetaPatches: false,
        url: identifier
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err)
      });
      return;
    }
    // passed a file location
    require("fs").readFile(identifier, "utf-8", (err, contents) => {
      if(err) {
        reject(err);
      }
      else {
        let spec;
        try {
          const spec = jsYaml.safeLoad(contents, 'utf8');
          Swagger.resolve({
            spec: spec,
            allowMetaPatches: false
          }).then((res) => resolve(res));
        }
        catch(e) {
          reject(e);
        }
      }
    });
  });
}

Swambda.prototype.lookup = function (path) {
  let operation = undefined;
  let params = {};

  this.routePaths.forEach((routePath) => {
    if(path === routePath.path) {
      operation = routePath.operation;
      params = {};
    }
    if(!operation) {
      let p = extractFromPath(routePath.path, path);
      if(Object.keys(p).length !== 0) {
        operation = routePath.operation;
        params = p;
      }
    }
  });
  if(operation) {
    return {
      value: operation,
      params: params
    };
  }
}

let extractFromPath =function (template, value) {
  const templateArr = template.split("/")
  const valueArr = value.split("/")

  if(templateArr.length !== valueArr.length) {
    return {};
  }

  return templateArr.reduce((obj, part, i) => {
    if(part.match(/\{.*\}/)) {
      const name = part.slice(1, -1)
      obj[name] = valueArr[i]
    }
    return obj
  }, {})
}

Swambda.prototype.process = function (event) {
  return new Promise((resolve, reject) => {
    if(!event || !event.path) {
      container.respondWith(resolve, 500, "invalid request sent");
      return;
    }
    let path = event.path;
    path = path.substring(path.indexOf(this.spec.basePath) + this.spec.basePath.length);

    const httpMethod = event.httpMethod.toLowerCase();
    if(httpMethod === "options") {
      container.respondWith(resolve, 200, "");
      return;
    }
    if(!path) {
      container.respondWith(resolve, 404, {
        code: 404,
        message: "invalid path"
      });
      return;
    }
    if(path === "/swagger.json") {
      container.respondWith(resolve, 200, this.spec);
      return;
    }
    const route = this.lookup(path);
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

    const operationParams = {};
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
        code: 404,
        message: "operationId `" + operationId + "` not found"
      });
      return;
    }
    (operation.parameters || [])
      .map((param) => {
        if(param.in === "path") {
          const value = params.extract(param, route.params);
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
          const value = params.extract(param, event.queryStringParameters);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        if(param.in === "header") {
          const value = params.extract(param, event.headers);
          if(typeof value !== "undefined") {
            args[param.name] = value;
          }
        }
        operationParams[param.name] = param;
    });

    let cls;
    const controllers = container.controllers;
    try {
      cls = require(`../../${controllers}/${controller}`);
    }
    catch(e) {
      try {
        cls = require(`./${controllers}/${controller}`);
      }
      catch (e) {
        container.respondWith(resolve, 400, {
          code: 400,
          message: "class " + controller + " not found"
        });
        return;
      }
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
              code: 500,
              message: "bad operation"
            });
          });
      });
  });
};

module.exports.prettyPrint = (error, value) => {
  console.log(JSON.stringify(value, null, 2));
};

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
};
