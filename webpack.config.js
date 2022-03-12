module.exports = {
  // change to .tsx if necessary
  entry: './src/app.jsx',
  output: {
    filename: './bundle.js'
  },
  resolve: {
    // if we are importing file in our code withoud extension like import 'import App from './components/App/App'
    // it will look for the file in the following orders ./components/App/App.ts, ./components/App/App.tsx, ./components/App/App.js, ./components/App/App.jsx
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      // changed from { test: /\.jsx?$/, use: { loader: 'babel-loader' }, exclude: /node_modules/ },
      { test: /\.(t|j)sx?$/, use: { loader: 'ts-loader' }, exclude: /node_modules/ },

      // addition - add source-map support
      { enforce: "pre", test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  // addition - add source-map support
  devtool: "source-map"
}