exports.findAll = (args) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: [{
        foo: "bar"
      }]
    });
  });
};
