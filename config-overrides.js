const webpack = require('webpack');

module.exports = function override(config, env) {
  // config.devServer.headers = {
  //   ...config.devServer.headers,
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Headers': '*',
  //   'Access-Control-Allow-Methods': '*',
  // }

  config.resolve.fallback = {
    'assert': require.resolve('assert'),
    'constants': require.resolve('constants-browserify'),
    'crypto': require.resolve('crypto-browserify'),
    'fs': false,
    'http': require.resolve('stream-http'),
    'https': require.resolve('https-browserify'),
    'os': require.resolve('os-browserify/browser'),
    'path': require.resolve('path-browserify'),
    'stream': require.resolve('stream-browserify'),
  }

  config.mode = 'development'
  config.optimization.minimize = false
  config.optimization.minimizer = []


  config.resolve.alias = {
    ...config.resolve.alias,
    process: 'process/browser.js',
  }
  
  config.module.rules = [
    ...config.module.rules,
  {
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
  }, {
    test: /\.wasm$/,
    type: 'asset/resource',
  }, {
    test: /\.bin$/,
    type: 'asset/resource',
  }, {
    resourceQuery: /asset/,
    type: 'asset/resource',
  }]

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
    }),
  ]) 

  config.ignoreWarnings = [/Failed to parse source map/]
  return config
}