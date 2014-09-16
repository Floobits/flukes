var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/flux.js",
  },
  output: {
    path: __dirname,
    filename: "flux.js",
    libraryTarget: "var",
    library: "flux"
  },
  externals: [
    "lodash"
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("app", "flux.js")
  ]
};
