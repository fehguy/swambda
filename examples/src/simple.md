# Basic Example

Building upon the swagger petstore, we have three files:


* [api.js](api.js).  This has the initialization and routing logic.
* [controllers/Pets.js].  Business logic lives here.
* [webpack.config.js].  A simple webpack configuration file.


To run, first install `netlify-lambda`:

```
npm i --save netlify-lambda
npm i --save-dev yml-loader
```

Then from the _root_ project root directory:

```
netlify-lambda build examples -c examples/webpack.config.js
```

Finally, open your browser to [http://localhost:9000/api/.netlify/functions/api/pets](http://localhost:9000/api/.netlify/functions/api/pets)

The example doesn't use a database (just an in-memory map) so don't expect this
to work in production.
