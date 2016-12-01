const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    publicPath: ''
  },
  module: {
    loaders: [
      { include: /\.json$/, loaders: ["json-loader"] },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-0' }
    ]
  },
  devServer: { historyApiFallback: true },
  plugins: [
    new HtmlWebpackPlugin({ title: 'Example', template: './index.html' })
  ],
}
