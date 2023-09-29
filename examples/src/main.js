"use strict";

let swambda = require("swambda");
const handler = exports.handler = (event, context, callback) => {
  // tell swambda to bind to a cache, global in this case
  swambda.cacheWith(global);

  swambda.fromCache()
    .catch((err) => {
      // not in cache, need to create

      // load via webpack yml-loader
      const swagger = require("yml-loader!./swagger.yml");

      // set the route path
      return new Swambda("/main/.netlify/functions/main")
        .cors()
        .preProcessor(preProcessor)
        .postProcessor(postProcessor)
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
    resolve (response);
  })
}
