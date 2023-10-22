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
    if (!args || !args.id) {
        return utils.respondTo(400, {
            code: 400,
            message: "an invalid pet id was supplied"
        },);
        return;
    }
    if (args.id === "2") {
        return utils.respondTo(200,
            {
                id: args.id,
                name: "gorilla"
            });
        return;
    }
    return utils.respondTo(404, {
        code: 404,
        message: "Pet not found"
    });
};

exports.addPet = (args) => {
    return utils.respondTo(200, args.body)
}