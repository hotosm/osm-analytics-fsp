var precss = require('precss')
var rucksack = require('rucksack-css')
var webpack = require('webpack')
var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  context: path.join(__dirname, './app'),
  entry: {
    jsx: './index.js',
    html: './index.html',
    vendor: ['react']
  },
  output: {
    path: path.join(__dirname, './static'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.css$/,
        include: /app/,
        //loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
        loaders: [
          'style-loader',
          //'css-loader?sourceMap',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules|libs/,
        loaders: [
          'react-hot',
          'babel-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: 'file-loader?name=assets/[name].[ext]'
      },
      {
        test: /\.(json)$/,
        loader: 'json-loader'
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  postcss: [
    precss(),
    rucksack({
      autoprefixer: true
    })
  ],
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') }
    }),
    new webpack.DefinePlugin({
      "global.GENTLY": false // https://github.com/visionmedia/superagent/wiki/Superagent-for-Webpack
    }),
    //new ExtractTextPlugin("style.css")
  ],
  devServer: {
    contentBase: './client',
    hot: true
  },
  node: {
    __dirname: true,
  }
}
