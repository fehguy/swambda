const path = require('path');
const yml = require('yml-loader');

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'lambda'),
    filename: 'main.js'
  },
  module: {
    loaders: [
      {
        test: /\.yaml$/,
        loader: 'yml-loader',
      }
    ]
  }
};
