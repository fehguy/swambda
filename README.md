# Swambda

Integrate swagger specifications and lambda into an easy-to-use routing tier.
This package is optimized for use with the [netlify](https://netlify.com) system.

By utilizing an OpenAPI specification and the swambda project, developers can
easily implement full REST API applications in Lambda without using an API
gateway or other infrastructure.  When used with the Netlify system, you can
host efficient, scalable REST APIs for free, while using the entire ecosystem
of the OpenAPI specification including spec editors, code generators, testing
systems, etc.

## Note! Project is not complete and not ready for production!

You can make a difference, too, by sending pull requests.

### Concept

Swambda will take a valid OpenAPI 2.0 specification and use a single operation
extension (`x-swagger-router-controller`) and `operationId` to extract arguments
and route requests directly to a controller function.  The arguments will be
parsed, extracted, and coerced into the format as designated by the OAI spec.
The developer's job is then to simply implement controller functions to perform
business logic.

It is expected that each controller function will return a promise, and can
optionally use a simple function to correctly format a response as appropriate
for the netlify platform.

#### Basic setup

Import the project and expose a single handler function:


```js
"use strict";

let swambda = require("swambda");

const handler = exports.handler = (event, context, callback) => {
```

initialize the Swambda library
```js
  new Swambda(event.path)
    .then(router => {
      return router.process(event);
    })
    .then(data => {
      callback(null, data)
    })
    .catch(err => {
      callback(null, err)
    });
};
```

Note! the `event.path` variable is used during initialization to help determine
where the library responses are being served from.  This eases the setup.

Configure optional features, so you can add authentication, response signing,
etc:

```js

new Swambda(event.path)
  .cors() // enable CORS and add additional response headers
  .preProcessor(preProcessor) // add a pre-processor for requests
  .postProcessor(postProcessor) // add a post-processor for responses
  //-> continue with loading
```

When configuring CORS support, you can optionally add headers in the function.
For example, if you want to allow a header called `Bearer`:

```js
  .cors({
    "Access-Control-Allow-Headers": "Content-Type, Bearer"
  })
```

The `preProcessor` can look like this:

```js
const preProcessor = function (event, args) {
  return new Promise((resolve, reject) => {
    // for example, detect the user from the headers using a custom function
    args[user] = detectUserFromHeaders(event.headers);
    resolve(args);
  });
}
```

The `postProcessor` can inject additional headers, handle special error codes, etc:

```js
const postProcessor = function (response) {
  return new Promise((resolve, reject) => {
    if(response.statusCode === 500) {
      response.headers["x-error-code"] = "abcd123";
    }
    resolve (response);
  })
}
```

Finally, implementing the business logic is easy!

```js
// load the utils to get the global `respondWith` function
const utils = require("swambda/utils");

const getPetById = exports.getPetById = (args) => {
  return new Promise((resolve, reject) => {
    const petId = args.petId;
    if(typeof petId === "undefined") {
      respondWith(resolve, 400, {
        code: 400,
        message: "invalid pet id"
      });
      return;
    }
    if(data[petId]) {
      respondWith(resolve, 200, data[petId]);
    }
    respondWith(resolve, 404, {
      code: 404,
      message: "pet not found"
    });
  })
}
```

#### FAQs

**What about performance?**  The swambda object is stored in a global cache after
setup, so there is no additional overhead to getting going.

**What parameter types are supported?**  Primitives and objects are currently
supported. Parameters with arrays, form data, dates are not (but easy to add).
