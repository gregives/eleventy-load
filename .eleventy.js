const fs = require('fs').promises

class EleventyLoad {
  constructor(config, options) {
    this.config = config
    this.options = options

    // Transform is our entry point
    this.config.addTransform('eleventy-load', this.processFile.bind(this))
  }

  // Process additional dependencies straight away
  async addDependency(path) {
    return await this.processFile(null, path)
  }

  // Get loaders for path
  getLoaders(path) {
    // Find which rule matches the given path
    const rule = this.options.rules.find((rule) => rule.test.test(path))

    // Return loaders if they exist, else null
    return rule && rule.loaders ? rule.loaders : null
  }

  // Load content of file
  async getContent(path, loaders) {
    // If loader has raw property, load content as buffer instead of string
    const encoding = loaders[0].loader.raw ? null : 'utf8'
    return await fs.readFile(path, { encoding })
  }

  // Process file with the given loaders
  async processFile(content, path, loaders = this.getLoaders(path)) {
    // Return content or path if no loaders match
    if (loaders === null)
      return content || path

    // If content isn't passed in, load from path
    if (content === null) {
      content = await this.getContent(path, loaders)
    }

    // Apply loaders to content in order
    for (const loader of loaders) {
      const loaderFunction = loader.loader.bind(this)
      content = await loaderFunction(content, loader.options)
    }

    return content
  }
}

module.exports = function(config, options) {
  return new EleventyLoad(config, options)
}
