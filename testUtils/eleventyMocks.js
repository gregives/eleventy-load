/**
 * Common interface to Eleventy used to test plugin integrations.
 *
 * Will need to add more mocks as breaking changes are made to the interface.
 * Tests should be maintained for each breaking major version.
 *
 * @module
 */

const inputDir = "./test/some/";
const outputDir = "./dist";
const inputPath = "./test/some/template.ejs";
const outputPath = "./dist/index.html";
const filePathStem = "/some";
const url = "/";

// Returns the values used to create the mock data
const getValues = () => ({
  inputDir,
  outputDir,
  inputPath,
  outputPath,
  filePathStem,
  url,
});

// Returns `this` context for eleventy callbacks etc
const version_0_x_x = () => ({
  inputPath,
  _config: {
    inputDir,
    dir: {
      input: inputDir,
      output: outputDir,
    },
  },
  page: {
    inputPath,
    outputPath,
    filePathStem,
    url,
  },
});

exports.v0_x_x = version_0_x_x;
exports.getValues = getValues;
