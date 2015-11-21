module.exports = {
  context: __dirname + '/src',
  entry: {
    javascript: './app.js',
    html: './index.html',
    css: './style.css',
  },

  output: {
    filename: 'app.js',
    path: __dirname + '/dist',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets:['es2015']
        }
      },
      {
        test: /\.html$|\.css$/,
        loader: 'file?name=[name].[ext]',
      },
    ],
  },
}
