const swambda = require("../index")
const expect = require("expect");
const fs = require("fs");

describe("initalization", () => {
  it("fails with invalid spec object", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    const spec = {swagger: "2.0"};

    new cache.Swambda("foo/bar")
      .cors()
      .load(spec)
      .then(router => {
        done("should have failed!");
      })
      .catch((err) => {
        expect(err.name).toBe("SyntaxError");
        done();
      });
  });

  it("loads a simple spec object", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    const spec = JSON.parse(fs.readFileSync("./test/specs/simple.json"));

    new swambda.Swambda("foo/bar")
      .cors()
      .load(spec)
      .then(router => {
        expect(router.prefix).toBe("foo/bar");
        expect(router.spec).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("loads a simple json spec from file", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    new swambda.Swambda("foo/bar")
      .cors()
      .load("./test/specs/simple.json")
      .then(router => {
        expect(router.prefix).toBe("foo/bar");
        expect(router.spec).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("loads a simple yaml spec from file", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    new swambda.Swambda("foo/bar")
      .cors()
      .load("./test/specs/simple.yaml")
      .then(router => {
        expect(router.prefix).toBe("foo/bar");
        expect(router.spec).toBeDefined();
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("fails to route an invalid event", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    new swambda.Swambda("foo/bar")
      .cors()
      .controllerDir("controllers")
      .load("./test/specs/simple.yaml")
      .then(router => {
        router.process()
        .then((response) => {
          expect(response.statusCode).toBe(500);
          done();
        })
      })
      .catch((err) => {
        done(err);
      });
  });

  it("routes an valid event", (done) => {
    let cache = {};
    swambda.cacheWith(cache);
    const event = {
      path: "/api/.netlify/functions/api/pets",
      httpMethod: "GET",
      queryStringParameters: {
        limit: 10
      }
    };
    new swambda.Swambda("/api/.netlify/functions/api")
      .controllerDir("test/controllers")
      .load("./test/specs/simple.yaml")
      .then(router => {
        router.process(event)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([{foo: "bar"}]);
            done();
          })
          .catch(err => {
            done(err);
          })
      })
      .catch((err) => {
        done(err);
      });
  });
});
