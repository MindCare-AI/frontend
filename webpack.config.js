// webpack.config.js
const path = require('path');

module.exports = function (env, argv) {
  return {
    mode: env.mode || 'development',
    entry: './index.ts',
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-gesture-handler': path.resolve(__dirname, 'patches/gesture-handler-mock.js'),
      },
    },
    plugins: [
      // Add any additional plugins here
    ],
  };
};
