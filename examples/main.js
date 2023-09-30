"use strict";

let swambda = require("swambda");

// tell webpack to pull all the javascript files from the `controllers` directory
var controllerMap = require.context('./controllers', true, /\.js$/);

exports.handler = (event, context, callback) => {
    // tell swambda to bind to a cache, global in this case
    swambda.cacheWith(global);

    swambda.fromCache()
        .catch(() => {
            // not in cache, need to create

            // load OpenAPI document via webpack yml-loader
            const swagger = require("yml-loader!./swagger.yml");

            // set the route path
            return new Swambda("/.netlify/functions/main")
                .cors()
                .preProcessor(preProcessor)
                .postProcessor(postProcessor)
                .controllerMap(controllerMap)
                .load(swagger)
                .then(router => {
                    return router;
                });
        })
        .then((router) => {
            return router.process(event);
        })
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => {
            console.log(err);
            callback(null, err);
        });
};

const preProcessor = function (event, args) {
    return new Promise((resolve, reject) => {
        // noop
        resolve(args);
    });
}

const postProcessor = function (response) {
    return new Promise((resolve, reject) => {
        // noop
        resolve(response);
    })
}
