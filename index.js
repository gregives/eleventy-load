const fs = require("fs");
const path = require("path");
const utils = require("./utils");

class EleventyLoad {
  constructor(options, cache, resource, content, config) {
    this.options = options;
    this.cache = cache;

    // Create context for loaders
    this.context = {
      addDependency: this.addDependency.bind(this),
      config,
      // Bind utils to EleventyLoad
      ...Object.keys(utils).reduce((acc, util) => {
        acc[util] = utils[util].bind(this);
        return acc;
      }, {}),
    };

    // Start processing initial dependency
    return this.addDependency(resource, content);
  }

  debug(string, override) {
    if (this.options.debug || override) {
      console.info(`[eleventy-load] ${string}`);
    }
  }

  // Process additional dependencies straight away
  async addDependency(resource, content = null) {
    const [resourcePath, resourceQuery] = resource.split(/(?=\?)/g);

    // Dependent resource
    const dependentResource = {
      resource: this.context.resource,
      resourcePath: this.context.resourcePath,
      resourceQuery: this.context.resourceQuery,
    };

    // Resolve resource for consistency
    const resolvedResource = path.resolve(
      this.context.config.inputDir,
      resource
    );
    const resolvedResourcePath = path.resolve(
      this.context.config.inputDir,
      resourcePath
    );

    // Define the current resource
    const currentResource = {
      resource,
      resourcePath,
      resourceQuery,
    };

    // Update context with current resource
    this.context = {
      ...this.context,
      ...currentResource,
    };

    // Start processing file and add to cache
    if (!this.cache.hasOwnProperty(resolvedResource)) {
      this.debug(`Processing resource: ${resource}`);
      this.cache[resolvedResource] = this.processFile(
        resource,
        resolvedResourcePath,
        content
      );
    }

    // Wait for resource to be processed
    const result = await this.cache[resolvedResource];

    // Reset to dependent resource
    this.context = {
      ...this.context,
      ...dependentResource,
    };
    return result;
  }

  // Get loaders for resource
  getLoaders(resourcePath) {
    // Find which rule matches the given resource path
    const rule = this.options.rules.find((rule) =>
      rule.test.test(resourcePath)
    );

    // Return loaders if they exist, else null
    return rule && rule.loaders ? rule.loaders : null;
  }

  // Load content of file
  getContent(resourcePath, loaders) {
    // If loader has raw property, load content as buffer instead of string
    const encoding = loaders[0].loader.raw ? null : "utf8";
    return fs.readFileSync(resourcePath, { encoding });
  }

  // Process file with the given loaders
  async processFile(resource, resourcePath, content) {
    // Get loaders for file
    const loaders = this.getLoaders(resourcePath);

    // Return content or path if no loaders match
    if (loaders === null) return content || resource;

    // If content isn't passed in, load from path
    if (content === null) {
      try {
        content = await this.getContent(resourcePath, loaders);
      } catch {
        return resource;
      }
    }

    // Apply loaders to content in order
    for (const loader of loaders) {
      const loaderFunction = loader.loader.bind(this.context);
      content = await loaderFunction(content, loader.options);
    }

    return content;
  }
}

// Create config frpm transform or shortcode context
function createConfig(type, config, context) {
  return {
    transform() {
      return {
        inputDir: path.normalize(context._config.dir.input),
        outputDir: path.normalize(context._config.dir.output),
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
}

module.exports = function (config, options) {
  // Return and warn if no rules are given
  if (!(options.rules instanceof Array)) {
    console.warn("[eleventy-load] Try giving me some rules!");
    return;
  }

  const cache = {};

  // Create new EleventyLoad instance in transform
  config.addTransform("eleventy-load", function (content) {
    const resource = path.relative(this._config.inputDir, this.inputPath);
    return new EleventyLoad(
      options,
      cache,
      resource,
      content,
      createConfig("transform", config, this)
    );
  });

  // Create new EleventyLoad instance in shortcode
  config.addShortcode("load", function (resource) {
    return new EleventyLoad(
      options,
      cache,
      resource,
      null,
      createConfig("shortcode", config, this)
    );
  });

  // Clear cache on re-runs
  config.on("beforeWatch", () => {
    for (const resource in cache) {
      delete cache[resource];
    }
  });
};
