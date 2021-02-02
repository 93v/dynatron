/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
// const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ terserOptions: { keep_classnames: true } })],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    filename: "index.js",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
  // externals: [nodeExternals()],
};
