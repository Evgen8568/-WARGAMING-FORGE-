var express = require("express");
var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin');

module.exports = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.(sass|scss)$/,
      use: ExtractTextPlugin.extract({
        use: [{
          loader: "css-loader",
          options: {
            url: false
          }
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: [
              autoprefixer({
                browsers: ['ie >= 8', 'last 4 version']
              })
            ],
            sourceMap: true
          }
        }, {
          loader: "sass-loader"
        }]
      })
    }]
  },
  plugins: [
    new ExtractTextPlugin('./style.css'),
    new OptimizeCssnanoPlugin({
      cssnanoOptions: {
        preset: ['default', {
          discardComments: {
            removeAll: true
          }
        }]
      }
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    open: true,
    port: 9000,
    before: function (app, server) {
      app.use("/api", express.static(path.join(__dirname, "data")));
    }
  }
};
