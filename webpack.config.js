const webpack = require('webpack');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');

module.exports = {
  entry: __dirname + '/src/index',
  devtool: 'source-map',
  output: {
    filename: 'excel-style-dataformatter.js'
  },
  bail: true,
  plugins: [
    new NyanProgressPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  }
};
