var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/flux.js",
    vendor: ["lodash"]
  },
  output: {
    path: __dirname,
    filename: "flux.js",
    libraryTarget: "var",
    library: "flux"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendor", "flux.deps.js"),
    new webpack.optimize.CommonsChunkPlugin("app", "flux.js")
  ]
};