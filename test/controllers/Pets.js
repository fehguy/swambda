const utils = require("../../src/utils");

exports.findAll = (args) => {
    return new Promise((resolve, reject) => {
        utils.respondWith(resolve, 200,
            [{
                foo: "bar"
            }]);
    });
};

exports.getPetById = (args) => {
    return new Promise((resolve, reject) => {
        if (!args || !args.id) {
            utils.respondWith(resolve, 400, {
                code: 400,
                message: "an invalid pet id was supplied"
            },);
            return;
        }
        if (args.id === "2") {
            utils.respondWith(resolve, 200,
                {
                    id: args.id,
                    name: "gorilla"
                });
            return;
        }
        utils.respondWith(resolve, 404, {
            code: 404,
            message: "Pet not found"
        });
    });
};
