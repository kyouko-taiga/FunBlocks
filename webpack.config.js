const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/build'),
  },
  module: {
    rules: [
      // This toolchain relates to the loading of Typescript and Javascript source files.
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/env',
                '@babel/typescript',
                '@babel/react',
              ],
              plugins: [],
            },
          },
          {
            loader: 'ts-loader',
          },
        ],
      },

      // The following settings relate to the configuration of the styles modules. The toolchain
      // starts by translating SASS to CSS, using `sass-loader`. The result is fed to `css-loader`
      // which translates CSS into a CommonJS module. Finally, `style-loader` inserts the relevant
      // styles directly into the HTML document.
      {
        test: /\.module\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCase',
              modules: {
                localIdentName: '[local]-[hash:base64:5]',
              }
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.scss'],
    alias: {
      FunBlocks: path.resolve(__dirname, 'src/'),
    },
  },
  devtool: 'source-map',
}
