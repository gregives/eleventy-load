const path = require("path");

function getDir(filePath, fallback) {
  if (filePath) {
    return path.normalize(path.dirname(filePath));
  }
  return path.normalize(fallback);
}

// Create config from transform or shortcode context
module.exports = function createConfig(type, config, context) {
  return {
    transform() {
      // Use v1 context paths, else fallback to internal config
      const { inputPath, outputPath, _config: { dir = {} } = {} } = context;
      return {
        inputDir: getDir(inputPath, dir.input),
        outputDir: getDir(outputPath, dir.output),
        ...config,
      };
    },
    shortcode() {
      const { inputPath, outputPath, filePathStem, url } = context.page;
      // Determine input and output directories from page context
      const [inputDir] = inputPath.split(filePathStem);
      const [outputDir] = outputPath.split(url);
      return {
        inputDir: path.normalize(inputDir),
        outputDir: path.normalize(outputDir),
        ...config,
      };
    },
  }[type]();
};
