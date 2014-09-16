var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/flux.js",
  },
  output: {
    path: __dirname,
    filename: "flux.js",
    libraryTarget: "commonjs2",
    library: "flux"
  },
  externals: [
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("app", "flux.js")
  ]
};
