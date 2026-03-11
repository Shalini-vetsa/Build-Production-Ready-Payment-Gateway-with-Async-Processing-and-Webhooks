const path = require("path");

module.exports = {
  entry: "./src/sdk/PaymentGateway.js",
  output: {
    filename: "checkout.js",
    path: path.resolve(__dirname, "dist"),
    library: "PaymentGateway",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
