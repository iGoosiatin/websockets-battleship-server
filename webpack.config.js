const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './index.ts',
  mode: "production",
  target: 'node18.16',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: [nodeExternals()],
};