const path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname + "/../netlify/functions/"),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
              test: /\.ya?ml$/,
              use: 'yaml-loader'
            }
          ]
    },
    optimization: {
        minimize: false
    },
};