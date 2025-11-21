const rules = require('./webpack.rules');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.vue$/,
  loader: 'vue-loader'
});

module.exports = {
  module: {
    rules,
  },
  plugins: [new VueLoaderPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
};
