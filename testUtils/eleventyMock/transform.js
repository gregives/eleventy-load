const { inputPath, inputDir, outputDir, outputPath } = require("./values");

// Returns `this` context for addTransform callback

const version_0_x_x = () => ({
  inputPath,
  _config: {
    inputDir,
    dir: {
      input: inputDir,
      output: outputDir,
    },
  },
});

const version_1_x_x = () => ({
  inputPath,
  outputPath,
});

exports.v0_x_x = version_0_x_x;
exports.v1_x_x = version_1_x_x;
