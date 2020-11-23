const fs = require("fs").promises;
const { resolve, parse } = require("path");
const utils = require("./utils");

class EleventyLoad {
  constructor(config, options) {
    this.options = options;

    // Create context for loaders
    this.context = {
      addDependency: this.addDependency.bind(this),
      // Bind utils to EleventyLoad
      ...Object.keys(utils).reduce((acc, util) => {
        acc[util] = utils[util].bind(this);
        return acc;
      }, {}),
    };

    // Create cache
    this.cache = {};

    // Keep reference to this
    const self = this;

    // Transform is our entry point
    config.addTransform("eleventy-load", function (...args) {
      self.context.config = this._config;
      return self.processFile(...args);
    });
  }

  // Process additional dependencies straight away
  async addDependency(path) {
    // Resolve path for consistency
    path = resolve(
      this.context.resource
        ? parse(this.context.resource).dir
        : this.context.config.inputDir,
      path
    );

    // Keep track of dependent resource
    const resource = this.context.resource;
    this.context.resource = path;

    // Return the result of processed file
    const result = this.cache.hasOwnProperty(path)
      ? this.cache[path]
      : await this.processFile(null, path);

    // Cache result of processed file
    this.cache[path] = result;

    this.context.resource = resource;
    return result;
  }

  // Get loaders for path
  getLoaders(path) {
    // Find which rule matches the given path
    const rule = this.options.rules.find((rule) => rule.test.test(path));

    // Return loaders if they exist, else null
    return rule && rule.loaders ? rule.loaders : null;
  }

  // Load content of file
  async getContent(path, loaders) {
    // If loader has raw property, load content as buffer instead of string
    const encoding = loaders[0].loader.raw ? null : "utf8";
    return await fs.readFile(path, { encoding });
  }

  // Process file with the given loaders
  async processFile(content, path, loaders = this.getLoaders(path)) {
    // Return content or path if no loaders match
    if (loaders === null) return content || path;

    // If content isn't passed in, load from path
    if (content === null) {
      content = await this.getContent(path, loaders);
    }

    // Apply loaders to content in order
    for (const loader of loaders) {
      const loaderFunction = loader.loader.bind(this.context);
      content = await loaderFunction(content, loader.options);
    }

    return content;
  }
}

module.exports = function (config, options) {
  return new EleventyLoad(config, options);
};
