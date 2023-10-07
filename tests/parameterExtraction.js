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
        const errors = [];
        const id = params.extract(param, { id: "100" }, errors, errors);
        expect(id).toBe(100);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const ids = params.extract(param, { ids: "100,101,102" }, errors);
        expect(Array.isArray(ids)).toBe(true);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const id = params.extract(param, { id: "bad!" }, errors);
        expect(errors.length).toBe(1);
        expect(id).not.toBeDefined();
    });

    it("extracts a boolean query parameter", () => {
        const param = {
            in: "query",
            name: "happy",
            type: "boolean",
            required: true
        };
        const errors = [];
        const happy = params.extract(param, { happy: "true" }, errors);
        expect(happy).toBe(true);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const moods = params.extract(param, { moods: "true false true true" }, errors);
        expect(Array.isArray(moods)).toBe(true);
        expect(errors.length).toBe(0);
        expect(moods.length).toBe(4);
    });

    it("ignores a mal-formed boolean query param", () => {
        const param = {
            in: "query",
            name: "happy",
            type: "boolean",
            required: true
        };
        const errors = [];
        const id = params.extract(param, { happy: "maybe?" }, errors);
        expect(errors.length).toBe(1);
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
        const errors = [];
        const birthday = params.extract(param, { birthday: "2015-10-26T07:46:36.611Z" }, errors);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const dates = params.extract(param, { dates: "2015-10-26T07:46:36.611Z\t2016-10-26T07:46:36.611Z\t2017-10-26T07:46:36.611Z" }, errors);
        expect(Array.isArray(dates)).toBe(true);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const ipoDate = params.extract(param, { ipoDate: "hmmm" }, errors);
        expect(errors.length).toBe(1);
        expect(ipoDate).not.toBeDefined();
    });

    it("extracts a string with whitespace", () => {
        const param = {
            in: "query",
            name: "fullName",
            type: "string",
            required: true
        };
        const errors = [];
        const fullName = params.extract(param, { fullName: "Jebediah Springfield" }, errors);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const people = params.extract(param, { people: "Jesus,Lucifer" }, errors);
        expect(Array.isArray(people)).toBe(true);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const people = params.extract(param, { people: "Bart\tLisa" }, errors);
        expect(Array.isArray(people)).toBe(true);
        expect(errors.length).toBe(0);
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
        const errors = [];
        const people = params.extract(param, { people: "Homer Marge" }, errors);
        expect(Array.isArray(people)).toBe(true);
        expect(errors.length).toBe(0);
        expect(people.length).toBe(2);
    });

    it("extracts a default string array", () => {
        const param = {
            in: "query",
            name: "people",
            type: "string",
            required: true
        };
        const errors = [];
        const people = params.extract(param, { people: ["Homer", "Marge"] }, errors);
        expect(Array.isArray(people)).toBe(true);
        expect(errors.length).toBe(0);
        expect(people.length).toBe(2);
    });
});
