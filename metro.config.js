const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  const { transformer, resolver } = config;
  
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    blacklistRE: /node_modules\/react-native\/ReactCommon\/.*/,
  };

  config.watcher = {
    ...config.watcher,
    ignore: [
      /node_modules\/react-native\/ReactCommon\/.*/,
      /node_modules\/@expo\/.*/,
      /\.git\/.*/,
      /android\/.*/,
      /ios\/.*/,
    ],
    watchman: {
      ignore_dirs: [
        'node_modules/react-native/ReactCommon',
        'node_modules/@expo',
        'node_modules/@react-native-async-storage',
        'node_modules/@react-native-community',
        'node_modules/@shopify',
        '.git',
        '.expo',
        'android',
        'ios'
      ]
    }
  };
  
  return config;
})();