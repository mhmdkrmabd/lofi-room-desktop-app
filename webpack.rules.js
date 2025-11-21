module.exports = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.(mp3|wav)$/,
    type: 'asset/resource',
    generator: {
      // Preserve full directory structure from src/renderer
      filename: '[path][name][ext]'
    }
  },
  {
    test: /\.(gif|png|jpe?g|svg|webp|ico)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/[name][ext]'
    }
  },
];
