module.exports = {
  mode: "production",
  entry: ["./src/index.js"],
  devtool: 'cheap-module-source-map',
  output: {
    path: __dirname + "/lib/",
    publicPath: "/lib/",
    filename: "index.js",
    // filename: "[name].js",
    // clear: true,
    libraryTarget: 'umd',  //发布组件专用
    library: 'md-antd',
    clean:true,
  },
  optimization: {
    minimize: false,
    // splitChunks: {
    //   chunks: 'all',
    // },
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout:300,
    poll:1000
  },
  resolve: {
    extensions: [".js", ".jsx"],
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
    ],
  },
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
    },
    antd: {
      root: "antd",
      commonjs2: "antd",
      commonjs: "antd",
      amd: "antd",
    },
    moment: {
      root: "moment",
      commonjs2: "moment",
      commonjs: "moment",
      amd: "moment",
    },
    'md-base': {
      root: "md-base",
      commonjs2: "md-base",
      commonjs: "md-base",
      amd: "md-base",
    },
  },
};
