const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development', // or 'production'
  target: 'web',
  resolve: {
    extensions: ['.js', '.json', '.mjs'], // Include .mjs for ES modules
    modules: ['node_modules', '.'],
    fallback: {
      "url": require.resolve("url/"),
      "util": require.resolve("util/"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "net": false,
      "tls": false,
      "fs": false,
      "dns": false,
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer/"), // Add buffer fallback
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Adjust the output path as needed
  },
};