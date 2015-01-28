var webpack = require("webpack");

module.exports = {
  entry: {
    app: "./lib/flux.js",
  },
  output: {
    path: __dirname,
    filename: "flux.js",
    libraryTarget: "commonjs2",
    library: "flux",
    sourcePrefix: "",
  },
  externals: [
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("app", "flux.js"),
    new webpack.optimize.UglifyJsPlugin({
      warnings: true,
      compress: false,
      output: {
        beautify: true,
        bracketize: true,
        indent_level: 2,
        semicolons: true,
        width: 120,
      },
    }),
  ]
};
