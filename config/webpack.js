module.exports = {
  devtool: 'eval',
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  output: {filename: 'spec.js' },
  resolve: {
    alias: {
      'raf': `${__dirname}/../spec/support/mock_raf.js`,
      'performance-now': `${__dirname}/../spec/support/mock_performance_now.js`
    }
  },
  quiet: true,
  watch: true
};
