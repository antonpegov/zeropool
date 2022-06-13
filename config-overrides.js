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

  config.resolve.alias = {
    ...config.resolve.alias,
    process: 'process/browser.js',
  }

  config.output = {
    ...config.output,
    // chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    chunkFormat: 'module',
  }

  
  config.optimization = {
    ...config.optimization,
    minimizer: config.optimization.minimizer.map(minimizer => {
      if (minimizer.options.minimizer.options) {
        minimizer.options.minimizer.options.keep_classnames = true
        minimizer.options.minimizer.options.keep_fnames = true
        minimizer.options.minimizer.options.compress = {
          ...minimizer.options.minimizer.options.compress,
          ecma: 8
        }
        minimizer.options.minimizer.options.output = {
          ...minimizer.options.minimizer.options.output,
          ecma: 8
        }
      }

      return minimizer
    }),
  }

  // config.output = {
  //   ...config.output,
  //   library: {
  //     type: 'module',
  //   }
  // }

  // config.experiments = {
  //   ...config.experiments,
  //   outputModule: true,
  // }
  
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

  config.plugins[0].version = 6
  config.ignoreWarnings = [
    {
      module: /source-map-loader/,
    },
  ]
  console.log(JSON.stringify(config))
  return config
}