const expect = require("expect");
const params = require("../src/params");

describe("parameter extraction", () => {
  it("extracts an integer query parameters", () => {
    const param = {
      in: "query",
      name: "id",
      type: "integer",
      format: "int64",
      required: true
    };
    const id = params.extract(param, {id: "100"});
    expect(id).toBe(100);
    expect(typeof id).toBe("number");
  });

  it("extracts a boolean query parameter", () => {
    const param = {
      in: "query",
      name: "happy",
      type: "boolean",
      required: true
    };
    const happy = params.extract(param, {happy: "true"});
    expect(happy).toBe(true);
    expect(typeof happy).toBe("boolean");
  });

  it("extracts a date query parameter", () => {
    const param = {
      in: "query",
      name: "birthday",
      type: "string",
      format: "date-time",
      required: true
    };
    const birthday = params.extract(param, {birthday: "2015-10-26T07:46:36.611Z"});
    expect(birthday.toString()).toBe(new Date("2015-10-26T07:46:36.611Z").toString());
    expect(typeof birthday).toBe("object");
  });
});
