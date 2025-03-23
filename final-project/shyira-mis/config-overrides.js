// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add your custom Webpack configuration here
  config.resolve.fallback = {
    ...config.resolve.fallback,
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
  };

  // Add any other customizations you need
  return config;
};