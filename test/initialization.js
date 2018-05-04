const expect = require("expect");
const fs = require("fs");
const swambda = require("../index")

describe("initalization", () => {
  it("fails with invalid spec object", (done) => {
    const spec = {swagger: "2.0"};

    new swambda.Swambda("foo/bar")
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
});
