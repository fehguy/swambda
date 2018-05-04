
module.exports.extract = (param, source) => {
  const value = source[param.name];
  if(typeof value === "undefined") {
    return;
  }
  try {
    switch(param.type) {
      case "integer":
        const result = parseInt(value);
        return isNaN(result) ? undefined : result;
      case "boolean":
        return value === "true" || value === true;
      case "string":
        if(param.format === "date-time") {
          return new Date(value);
        }
        return value;
      default:
        return value;
    }
  }
  catch (e) {

  }
};
