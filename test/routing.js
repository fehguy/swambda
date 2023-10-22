const swambda = require("../index")
const expect = require("expect");
const fs = require("fs");

describe("routing", () => {
    it("fails to route an invalid event", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        new swambda.Swambda("foo/bar")
            .cors()
            .controllerDir("controllers")
            .load("./tests/specs/simple-v2.yaml")
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

    it("uses the cache", (done) => {
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
            .controllerDir("tests/controllers")
            .load("./tests/specs/simple-v2.yaml")
            .then(router => {
                router.process(event)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(JSON.parse(response.body)).toEqual([{ foo: "bar" }]);
                        swambda.fromCache()
                            .then((res) => {
                                res.process(event)
                                    .then((response) => {
                                        expect(response.statusCode).toBe(200);
                                        expect(JSON.parse(response.body)).toEqual([{ foo: "bar" }]);
                                        done();
                                    })
                            });
                    })
                    .catch(err => {
                        done(err);
                    })
            })
            .catch((err) => {
                done(err);
            });
    });

    it("routes a valid path parameter", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        const event = {
            path: "/api/.netlify/functions/api/pets/2",
            httpMethod: "GET"
        };
        new swambda.Swambda("/api/.netlify/functions/api")
            .controllerDir("tests/controllers")
            .load("./tests/specs/simple-v2.yaml")
            .then(router => {
                router.process(event)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(JSON.parse(response.body)).toEqual({
                            id: "2",
                            name: "gorilla"
                        });
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

    it("routes a valid path parameter with a v3 spec", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        const event = {
            path: "/api/.netlify/functions/api/pet/2",
            httpMethod: "GET"
        };
        new swambda.Swambda("/api/.netlify/functions/api")
            .controllerDir("tests/controllers")
            .load("./tests/specs/petstore-v3.yaml")
            .then(router => {
                router.process(event)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(JSON.parse(response.body)).toEqual({
                            id: "2",
                            name: "gorilla"
                        });
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

    it("routes a valid post parameter with a v3 spec", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        const event = {
            path: "/api/.netlify/functions/api/pet",
            httpMethod: "POST",
            body: JSON.stringify({
                "id": 1234567,
                name: "Lizard"
            })
        };
        new swambda.Swambda("/api/.netlify/functions/api")
            .controllerDir("tests/controllers")
            .load("./tests/specs/petstore-v3.yaml")
            .then(router => {
                router.process(event)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(JSON.parse(response.body)).toEqual({
                            id: 1234567,
                            name: "Lizard"
                        });
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
