const path = require("path");
const pkg = require("./package.json");
const { createConfig } = require("./utils");
const EleventyLoad = require("./EleventyLoad");

module.exports = function (config, options) {
  try {
    config.versionCheck(pkg["11ty"].compatibility);
  } catch (e) {
    console.warn(
      `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`
    );
  }

  // Return and warn if no rules are given
  if (!(options.rules instanceof Array)) {
    console.warn(`[${pkg.name}] Try giving me some rules!`);
    return;
  }

  const cache = {};

  // Create new EleventyLoad instance in transform
  config.addTransform(
    "eleventy-load",
    function (content, deprecatedOutputPath) {
      // 11ty@1.x.x does not expose _config but inputPath should be relative to
      // the project route so we can use the node cwd.
      const inputDir = process.cwd();
      // outputPath argument is deprecated in 11ty@1.x.x
      const outputPath = deprecatedOutputPath || this.outputPath;
      const resource = path.relative(inputDir, this.inputPath);
      return new EleventyLoad(
        options,
        cache,
        resource,
        content,
        createConfig("transform", config, this),
        outputPath
      );
    }
  );

  // Create new EleventyLoad instance in shortcode
  config.addShortcode("load", function (resource) {
    return new EleventyLoad(
      options,
      cache,
      resource,
      null,
      createConfig("shortcode", config, this),
      null
    );
  });

  // Clear cache on re-runs
  // TODO: update deprecated event name v0.11.0
  // https://www.11ty.dev/docs/events/#eleventy.beforewatch
  config.on("beforeWatch", () => {
    for (const resource in cache) {
      delete cache[resource];
    }
  });
};
