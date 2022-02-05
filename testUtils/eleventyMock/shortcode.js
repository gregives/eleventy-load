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

exports.v0_x_x = version_0_x_x;
