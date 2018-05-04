const expect = require("expect");
const params = require("../src/params");

describe("parameter extraction", () => {
  it("extracts an integer query parameter", () => {
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

  it("extracts an integer array parameters", () => {
    const param = {
      in: "query",
      name: "ids",
      type: "integer",
      format: "int64",
      collectionFormat: "csv",
      required: true
    };
    const ids = params.extract(param, {ids: "100,101,102"});
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBe(3);
  });


  it("ignores a mal-formed integer query param", () => {
    const param = {
      in: "query",
      name: "id",
      type: "integer",
      format: "int64",
      required: true
    };
    const id = params.extract(param, {id: "bad!"});
    expect(id).not.toBeDefined();
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

  it("extracts a boolean array query parameter", () => {
    const param = {
      in: "query",
      name: "moods",
      type: "boolean",
      collectionFormat: "ssv",
      required: true
    };
    const moods = params.extract(param, {moods: "true false true true"});
    expect(Array.isArray(moods)).toBe(true);
    expect(moods.length).toBe(4);
  });

  it("ignores a mal-formed boolean query param", () => {
    const param = {
      in: "query",
      name: "happy",
      type: "boolean",
      required: true
    };
    const id = params.extract(param, {happy: "maybe?"});
    expect(id).not.toBeDefined();
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
  });

  it("extracts a date array query parameter", () => {
    const param = {
      in: "query",
      name: "dates",
      type: "string",
      format: "date-time",
      collectionFormat: "tsv",
      required: true
    };
    const dates = params.extract(param, {dates: "2015-10-26T07:46:36.611Z\t2016-10-26T07:46:36.611Z\t2017-10-26T07:46:36.611Z\t"});
    expect(Array.isArray(dates)).toBe(true);
    expect(dates.length).toBe(3);
  });

  it("ignores a mal-formed date query param", () => {
    const param = {
      in: "query",
      name: "ipoDate",
      type: "string",
      format: "date-time",
      required: true
    };
    const ipoDate = params.extract(param, {ipoDate: "hmmm"});
    expect(ipoDate).not.toBeDefined();
  });

  it("extracts a string with whitespace", () => {
    const param = {
      in: "query",
      name: "fullName",
      type: "string",
      required: true
    };
    const fullName = params.extract(param, {fullName: "Jebediah Springfield"});
    expect(fullName).toBe("Jebediah Springfield");
  });

  it("extracts a csv string array", () => {
    const param = {
      in: "query",
      name: "people",
      type: "string",
      collectionFormat: "csv",
      required: true
    };
    const people = params.extract(param, {people: "Jesus,Lucifer"});
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBe(2);
  });

  it("extracts a tsv string array", () => {
    const param = {
      in: "query",
      name: "people",
      type: "string",
      collectionFormat: "tsv",
      required: true
    };
    const people = params.extract(param, {people: "Bart\tLisa"});
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBe(2);
  });

  it("extracts a ssv string array", () => {
    const param = {
      in: "query",
      name: "people",
      type: "string",
      collectionFormat: "ssv",
      required: true
    };
    const people = params.extract(param, {people: "Homer Marge"});
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBe(2);
  });

  it("extracts a default string array", () => {
    const param = {
      in: "query",
      name: "people",
      type: "string",
      required: true
    };
    const people = params.extract(param, {people: ["Homer", "Marge"]});
    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBe(2);
  });

});
