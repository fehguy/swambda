# Basic Example

Building upon the swagger petstore, we have some files:


* [src/main.js](src/main.js).  This has the initialization and routing logic.
* [src/controllers/Pets.js](src/controllers/Pets.js).  Business logic lives here.
* [netlify.toml](netlify.toml).  A netlify configuration file that specifies the functions output
* [webpack.conf.js](webpack.conf.js).  A simple webpack configuration file.


To run, copy this folder to a new location.  In the root of that folder, install
`netlify-lambda`:

```
npm i --save-dev netlify-lambda yml-loader
```

Then install packages in the `src` folder:

```
cd src
npm i
```

AWS Lambda with node is great for hello world, but typically you have
dependencies.  That means you either bundle everything up in a single
JavaScript or upload a zip file.  Since zipping is nasty, we'll use
webpack to bundle things up.

Note, if you're not used to webpack, get ready for a hill climb. It brings
many oddities into the process.

Build the bundle, which goes in `./lambda/main.js`.  This includes all the
dependencies in `src/node_modules`:

```
export NODE_OPTIONS=--openssl-legacy-provider  

netlify-lambda build . -c webpack.conf.js
```

Run the code and let `netlify-lambda` watch for changes:

```
netlify-lambda serve . -c webpack.conf.js
```

Finally, after running the `serve` command, open your browser to [http://localhost:9000/api/.netlify/functions/api/pets](http://localhost:9000/main/.netlify/functions/main/pets) to see the calling of the `findAll(args)` function.  If a `limit` query param is supplied, it'll be passed in the `args`
hash.

The library exposes a special route, `/swagger.json` for usage with [swagger-ui](https://github.com/swagger-api/swagger-ui/blob/master/README.md).  You can hit it [locally](http://localhost:9000/main/.netlify/functions/main/swagger.json) (note the derived `basePath`!) or just load it up in swagger-ui using the
online petstore:

http://petstore.swagger.io/?url=http://localhost:9000/main/.netlify/functions/main/swagger.json

The example doesn't use a database (just an in-memory map) so don't expect this
to work in production.
