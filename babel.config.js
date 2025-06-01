module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      [
        '@babel/preset-typescript',
        {
          allowDeclareFields: true,
          allowNamespaces: true,
        }
      ]
    ],
    plugins: [
      ['react-native-reanimated/plugin', {
        relativeSourceLocation: true,
      }],
      ['babel-plugin-module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
          '^react-native$': 'react-native'
        }
      }],
      '@babel/plugin-transform-runtime',
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    }
  };
};
