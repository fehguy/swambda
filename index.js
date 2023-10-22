"use strict";

const Swagger = require("swagger-client");
const params = require("./src/params");
const jsYaml = require("js-yaml");
const utils = require("./src/utils");
const Router = require("./src/router").Router;

const fs = require("fs")

var resolver = ((container, path) => {
    if (typeof container.controllerMap === "undefined") {
        let p = process.cwd() + `/test/controllers/${path}`;
        return require(p)
    }
    else {
        let cls = `./${path}.js`;
        return container.controllerMap(cls);
    }
})

let container = {
    controllers: "./controllers",
    controllerResolver: resolver
};

module.exports.cacheWith = (cache) => {
    const existing = container;
    utils.cacheWith(cache);
    container = cache;
    if (existing.controllerResolver) {
        container.controllerResolver = existing.controllerResolver;
    }
    if (existing.controllers) {
        container.controllers = existing.controllers;
    }
    if (existing.requestInterceptor) {
        container.requestInterceptor = existing.requestInterceptor;
    }
    if (existing.responseInterceptor) {
        container.responseInterceptor = existing.responseInterceptor;
    }
    if (existing.extraHeaders) {
        container.extraHeaders = existing.extraHeaders;
    }
    container.Swambda = Swambda;
    container.respondWith = utils.respondWith;
};

module.exports.fromCache = () => {
    return new Promise((resolve, reject) => {
        if (container.swambda) {
            resolve(container.swambda);
        }
        else {
            reject();
        }
    });
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
                resolve(response);
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

Swambda.prototype.controllerMap = function (controllerMap) {
    container.controllerMap = controllerMap;
    return this;
}

Swambda.prototype.controllerDir = function (controllerDir) {
    container.controllers = controllerDir;
    return this;
};

Swambda.prototype.cors = function (extra) {
    const headers = extra || {};
    if (!headers["Access-Control-Allow-Origin"]) {
        headers["Access-Control-Allow-Origin"] = "*";
    }
    if (!headers["Access-Control-Allow-Methods"]) {
        headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, PUT, OPTIONS";
    }
    if (!headers["Access-Control-Allow-Headers"]) {
        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    }
    container.extraHeaders = headers;
    return this;
};

Swambda.prototype.load = function (identifier) {
    return new Promise((resolve, reject) => {
        if (container.swambda) {
            resolve(container.swambda);
            return;
        }
        const self = this;

        resolveSpec(identifier)
            .then(res => {
                self.spec = res.spec;
                if (self.spec.swagger) {
                    self.spec.basePath = this.prefix;
                }
                else {
                    self.spec.servers = [{
                        url: this.prefix
                    }];
                }

                const router = new Router();
                router.compilePaths(self.spec.paths);
                self.router = router;

                container.swambda = self;
                resolve(self);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

var resolveSpec = function (identifier) {
    // passed a spec object
    return new Promise((resolve, reject) => {
        if (typeof identifier === "object") {
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
        if (identifier.indexOf("http://") === 0 || identifier.indexOf("https://") === 0) {
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
            if (err) {
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
                catch (e) {
                    reject(e);
                }
            }
        });
    });
}

Swambda.prototype.process = function (event) {
    return new Promise((resolve, reject) => {
        if (!event || !event.path) {
            container.respondWith(resolve, 500, "invalid request sent");
            return;
        }
        let path = event.path;
        let basePath;

        if (this.spec.swagger) {
            basePath = this.spec.basePath;
        }
        else {
            basePath = this.spec.servers[0].url;
        }
        path = path.substring(path.indexOf(basePath) + basePath.length);

        const httpMethod = event.httpMethod.toLowerCase();
        if (httpMethod === "options") {
            container.respondWith(resolve, 200, "");
            return;
        }
        if (!path) {
            container.respondWith(resolve, 404, {
                code: 404,
                message: "invalid path"
            });
            return;
        }
        if (path === "/swagger.json") {
            container.respondWith(resolve, 200, this.spec);
            return;
        }
        if (path === "/openapi.json") {
            container.respondWith(resolve, 200, this.spec);
            return;
        }
        if (path === "/openapi.yaml") {
            let yaml = jsYaml.dump(this.spec);
            container.respondWith(resolve, 200, yaml);
            return;
        }
        const route = this.router.lookup(path);
        if (!route) {
            container.respondWith(resolve, 404, {
                code: 404,
                message: `path ${path} not found`
            });
            return;
        }
        const operation = route.value[httpMethod];
        if (!operation) {
            container.respondWith(resolve, 404, {
                code: 404,
                message: `operation '${httpMethod}' not found`
            });
            return;
        }

        const operationParams = {};
        const args = {};
        const controller = operation["x-swagger-router-controller"];
        if (!controller) {
            container.respondWith(resolve, 404, {
                code: 404,
                message: "controller `" + controller + "` not found"
            });
            return;
        }
        const operationId = operation.operationId;
        if (!operationId) {
            container.respondWith(resolve, 404, {
                code: 404,
                message: "operationId `" + operationId + "` not found"
            });
            return;
        }
        (operation.parameters || [])
            .map((param) => {
                if (param.in === "path") {
                    const value = params.extract(param, route.params);
                    if (typeof value !== "undefined") {
                        args[param.name] = value;
                    }
                }
                if (param.in === "body") {
                    const value = parseBody(event.headers, event.body);
                    if (typeof value !== "undefined") {
                        args[param.name] = value;
                    }
                }
                if (param.in === "query") {
                    const value = params.extract(param, event.queryStringParameters);
                    if (typeof value !== "undefined") {
                        args[param.name] = value;
                    }
                }
                if (param.in === "header") {
                    const value = params.extract(param, event.headers);
                    if (typeof value !== "undefined") {
                        args[param.name] = value;
                    }
                }
                operationParams[param.name] = param;
            });

        if (operation.requestBody && operation.requestBody.content) {
            const requestBodyJson = operation.requestBody.content["application/json"];
            if(typeof requestBodyJson !== "undefined") {
                try {
                    args["body"] = JSON.parse(event.body);
                }
                catch (e) {
                    args["body"] = event.body;
                }
            }
        }

        var cls = container.controllerResolver(container, controller);
        if (!cls || typeof cls[operationId] !== "function") {
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
                        console.log("....response")
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
    if (typeof body === "undefined") {
        return;
    }
    if (headers && headers["content-type"]) {
        try {
            return JSON.parse(body);
        }
        catch (e) {
            return body;
        }
    }
};
