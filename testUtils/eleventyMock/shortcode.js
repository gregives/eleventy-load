const { inputPath, outputPath, filePathStem, url } = require("./values");

// Returns `this` context for addShortcode callback
const version_0_x_x = () => ({
  page: {
    inputPath,
    outputPath,
    filePathStem,
    url,
  },
});

const version_1_x_x = () => ({
  ctx: {}, // not used by plugin
  page: {
    inputPath,
    outputPath,
    filePathStem,
    url,
  },
});

exports.v0_x_x = version_0_x_x;
exports.v1_x_x = version_1_x_x;
