const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, "demo/index.html"),
  filename: "./index.html",
});

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: path.join(__dirname, "src/index.js"),
  devServer: {
    port: 3007,
    hot:true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.join(__dirname, "src"),
      'md-base': path.join(__dirname, 'src/common/md/md-base/src/index'),
      'md-base-ui': path.join(__dirname, 'src/common/md/md-base-ui/src/index'),
      'md-antd': path.join(__dirname, 'src/common/md/md-antd/src/index'),
      'md-mock': path.join(__dirname, 'src/common/md/md-mock/src/index'),
    }
  },
  module: {
    // loaders: [
    //   // { test: /\.js|jsx$/, use: {loader: 'babel-loader', options: {presets: ['@babel']}}, exclude: /node_modules/ },
    //   { test: /\.js|jsx$/, loader: "babel-loader", exclude: /node_modules/ },
    // ],
    rules: [
      {
        test: /\.jsx|js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [htmlWebpackPlugin],
};
