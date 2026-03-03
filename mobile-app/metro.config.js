const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add SVG support
config.resolver.sourceExts.push('svg');

// Increase timeout for large bundles
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  compress: {
    ...config.transformer.minifierConfig?.compress,
    drop_console: process.env.NODE_ENV === 'production',
  },
};

module.exports = config;