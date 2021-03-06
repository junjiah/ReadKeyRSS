module.exports = {
  context: __dirname + '/src',
  entry: {
    javascript: './app.js',
    html: ['./index.html', './login.html'],
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
          presets:['es2015'],
        },
      },
      {
        test: /\.html$|\.css$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.svg$|\.png$/,
        loader: 'file?name=assets/[name].[ext]',
      },
    ],
  },
  
  devServer: {
    proxy: {
      '/subscription': {
        target: 'http://localhost:8080',
      },
      '/subscription/*': {
        target: 'http://localhost:8080',
      },
      '/feed/*': {
        target: 'http://localhost:8080',
      },
      '/unreadcount/*': {
        target: 'http://localhost:8080',
      },
    },
  },
};
