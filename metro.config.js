const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  const { transformer, resolver } = config;
  
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };
    config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    platforms: ['native', 'android', 'ios', 'web', 'ts', 'tsx', 'js', 'jsx'],
    alias: {
      // Add this alias to help with web compatibility
      'react-native-svg': require.resolve('react-native-svg/lib/module/index.js'),
      // Add gesture handler alias for web compatibility
      'react-native-gesture-handler': require.resolve('react-native-gesture-handler'),
    },
  };
  config.watchFolders = [__dirname];
  
  // Add resolver for our polyfill
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
  
  return config;
})();