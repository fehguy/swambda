const swambda = require("../index")
const expect = require("expect");
const fs = require("fs");

describe("initalization", () => {
    it("fails with invalid spec object", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        const spec = { swagger: "2.0" };

        new cache.Swambda("foo/bar")
            .cors()
            .load(spec)
            .then(router => {
                done("should have failed!");
            })
            .catch((err) => {
                expect(err.name).toBe("TypeError");
                done();
            });
    });

    it("loads a simple spec object", (done) => {
        let cache = {};
        swambda.cacheWith(cache);
        const spec = JSON.parse(fs.readFileSync("./test/specs/simple-v2.json"));

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
            .load("./test/specs/simple-v2.json")
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
            .load("./test/specs/simple-v2.yaml")
            .then(router => {
                expect(router.prefix).toBe("foo/bar");
                expect(router.spec).toBeDefined();
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
