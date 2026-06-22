const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK uses .cjs files
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];
// Workaround for "Component auth has not been registered yet"
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
