const fs = require("fs").promises;
const path = require("path");
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
      const resource = path.relative(this._config.inputDir, this.inputPath);
      return self.addDependency(resource, content);
    });
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

    const resolvedDirectory = dependentResource.resource
      ? path.resolve(
          this.context.config.inputDir,
          path.parse(dependentResource.resourcePath).dir
        )
      : this.context.config.inputDir;

    // Resolve resource for consistency
    const resolvedResource = path.resolve(resolvedDirectory, resource);
    const resolvedResourcePath = path.resolve(resolvedDirectory, resourcePath);

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

    // Return the result of processed file
    const result = this.cache.hasOwnProperty(resolvedResource)
      ? this.cache[resolvedResource]
      : await this.processFile(resource, resolvedResourcePath, content);

    // Cache result of processed file
    this.cache[resolvedResource] = result;

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
  async getContent(resourcePath, loaders) {
    // If loader has raw property, load content as buffer instead of string
    const encoding = loaders[0].loader.raw ? null : "utf8";
    return await fs.readFile(resourcePath, { encoding });
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

module.exports = function (config, options) {
  return new EleventyLoad(config, options);
};
