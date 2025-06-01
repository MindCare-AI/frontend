module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow',
      [
        '@babel/preset-typescript',
        {
          allowDeclareFields: true,
          allowNamespaces: true,
        }
      ]
      [
        '@babel/preset-typescript',
        {
          allowDeclareFields: true,
          allowNamespaces: true,
        }
      ]
    ],
    plugins: [
      '@babel/plugin-syntax-flow',
      '@babel/plugin-transform-flow-strip-types',
      'react-native-reanimated/plugin',
    ],
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