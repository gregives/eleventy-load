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
    config.addTransform("eleventy-load", function (content) {
      self.context.config = this._config;
      return self.addDependency(resolve(this.inputPath), content);
    });
  }

  // Process additional dependencies straight away
  async addDependency(path, content = null) {
    // Resolve path for consistency
    path = resolve(
      this.context.resource
        ? parse(this.context.resource).dir
        : this.context.config.inputDir,
      path
    );

    // Allow for query parameters
    const [pathname, query] = path.split(/(?=\?)/g);

    // Keep track of dependent resource
    const { resource, resourcePath, resourceQuery } = this.context;
    this.context.resource = path;
    this.context.resourcePath = pathname;
    this.context.resourceQuery = query;

    // Return the result of processed file
    const result = this.cache.hasOwnProperty(path)
      ? this.cache[path]
      : await this.processFile(path, pathname, content);

    // Cache result of processed file
    this.cache[path] = result;

    // Return to dependent resource
    this.context = {
      ...this.context,
      ...{ resource, resourcePath, resourceQuery },
    };
    return result;
  }

  // Get loaders for path
  getLoaders(pathname) {
    // Find which rule matches the given path
    const rule = this.options.rules.find((rule) => rule.test.test(pathname));

    // Return loaders if they exist, else null
    return rule && rule.loaders ? rule.loaders : null;
  }

  // Load content of file
  async getContent(pathname, loaders) {
    // If loader has raw property, load content as buffer instead of string
    const encoding = loaders[0].loader.raw ? null : "utf8";
    return await fs.readFile(pathname, { encoding });
  }

  // Process file with the given loaders
  async processFile(path, pathname, content) {
    // Get loaders for file
    const loaders = this.getLoaders(pathname);

    // Return content or path if no loaders match
    if (loaders === null) return content || path;

    // If content isn't passed in, load from path
    if (content === null) {
      content = await this.getContent(pathname, loaders);
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
