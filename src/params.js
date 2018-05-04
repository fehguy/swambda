
module.exports.extract = (param, source) => {
  const value = source[param.name];
  if(typeof value === "undefined") {
    return;
  }
  try {
    if(param.collectionFormat) {
      let parts, output = [];
      switch(param.collectionFormat) {
        case "csv":
          parts = value.split(",");
          parts.forEach((part) => {
            const val = extractOne(param, part.trim());
            if(typeof val !== "undefined") {
              output.push(val);
            }
          });
          return output;
        case "tsv":
          parts = value.split("\t");
          parts.forEach((part) => {
            const val = extractOne(param, part.trim());
            if(typeof val !== "undefined") {
              output.push(val);
            }
          });
          return output;
        case "ssv":
          parts = value.split(" ");
          parts.forEach((part) => {
            const val = extractOne(param, part.trim());
            if(typeof val !== "undefined") {
              output.push(val);
            }
          });
          return output;
        default:
          if(Array.isArray(value)) {
            value.forEach((v) => {
              const val = extractOne(param, part.trim());
              if(typeof val !== "undefined") {
                output.push(val);
              }
            })
          }
          return output;
      }
    }
    else {
      return extractOne(param, value);
    }
  }
  catch (e) {

  }
};

const extractOne = (param, value) => {
  switch(param.type) {
    case "integer":
      const result = parseInt(value);
      return isNaN(result) ? undefined : result;
      break;
    case "boolean":
      if(value === "true" || value === true) {
        return true;
      }
      if(value === "false" || value === false) {
        return false;
      }
      return;
    case "string":
      if(param.format === "date-time") {
        const date = new Date(value);
        if(isNaN(date.getDate())) {
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
