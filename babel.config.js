module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript'
    ],
    plugins: [
      ['react-native-reanimated/plugin', {
        relativeSourceLocation: true,
      }],
      ['module-resolver', {
        alias: {
          '^react-native$': 'react-native'
        }
      }],
      '@babel/plugin-transform-runtime', // Handle platform constants
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    }
  };
};
