
module.exports.extract = (param, source, errors) => {
    errors = errors || [];
    const value = source[param.name];
    if (typeof value === "undefined") {
        return;
    }
    try {
        if (param.collectionFormat) {
            let parts, output = [];
            switch (param.collectionFormat) {
                case "csv":
                    parts = value.split(",");
                    parts.forEach((part) => {
                        const val = extractOne(param, part.trim(), errors);
                        if (typeof val !== "undefined") {
                            output.push(val);
                        }
                    });
                    return output;
                case "tsv":
                    parts = value.split("\t");
                    parts.forEach((part) => {
                        const val = extractOne(param, part.trim(), errors);
                        if (typeof val !== "undefined") {
                            output.push(val);
                        }
                    });
                    return output;
                case "ssv":
                    parts = value.split(" ");
                    parts.forEach((part) => {
                        const val = extractOne(param, part.trim(), errors);
                        if (typeof val !== "undefined") {
                            output.push(val);
                        }
                    });
                    return output;
                default:
                    if (Array.isArray(value)) {
                        value.forEach((v) => {
                            const val = extractOne(param, part.trim(), errors);
                            if (typeof val !== "undefined") {
                                output.push(val);
                            }
                        })
                    }
                    return output;
            }
        }
        else {
            return extractOne(param, value, errors);
        }
    }
    catch (e) {
        errors.push("failed to extract " + param.in + " parameter");
    }
};

const extractOne = (param, value, errors) => {
    switch (param.type) {
        case "integer":
            const result = parseInt(value);
            if (isNaN(result)) {
                errors.push("unable to convert " + param.in + " parameter '" + param.name + "' to integer");
                return;
            }
            return result;
            break;
        case "boolean":
            if (value === "true" || value === true) {
                return true;
            }
            if (value === "false" || value === false) {
                return false;
            }
            errors.push("unable to convert " + param.in + " parameter '" + param.name + "' to boolean");
            return;
        case "string":
            if (param.format === "date-time") {
                const date = new Date(value);
                if (isNaN(date.getDate())) {
                    errors.push("unable to convert " + param.in + " parameter '" + param.name + "' to date");
                    return;
                }
                else {
                    return date;
                }
            }
            return value;
        default:
            return value;
    }
}
