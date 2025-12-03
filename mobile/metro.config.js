const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, "..", "shared"),
  path.resolve(__dirname, "..", "server"),
];

config.resolver.extraNodeModules = {
  shared: path.resolve(__dirname, "..", "shared"),
  server: path.resolve(__dirname, "..", "server"),
};

module.exports = config;
