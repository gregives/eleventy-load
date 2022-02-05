const { inputPath, inputDir, outputDir } = require("./values");

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

exports.v0_x_x = version_0_x_x;
