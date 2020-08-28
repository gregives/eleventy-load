const fs = require('fs')

class EleventyLoad {
  constructor(config, options) {
    this.options = options
    this.files = []

    // Transform is our entry point
    config.addTransform('eleventy-load', this.start.bind(this))
  }

  // Context of loaders
  get loaderContext() {
    return {
      files: this.files,
      addDependency: this.addDependency
    }
  }

  // Add dependency to file queue
  addDependency(path) {
    this.files.push(path)
  }

  // Start processing files from entry point
  start(content, entry) {
    const loaders = this.getLoaders(entry)

    // Return content if no loaders match
    if (loaders === null)
      return content

    // Process entry file with loaders
    content = this.processFile(content, loaders)

    // Process files added to queue
    this.processFileQueue()

    return content
  }

  // Get loaders for path
  getLoaders(path) {
    // Find which rule matches the given path
    const applicableRule = this.options.rules.find((rule) => rule.test.test(path))

    // Return loaders if they exist or null
    return applicableRule === undefined ? null : applicableRule.loaders
  }

  // Process file with the given loaders
  processFile(content, loaders) {
    // Apply loaders to content in order
    for (const loader of loaders) {
      const loaderFunction = loader.loader.bind(this.loaderContext)
      content = loaderFunction(content, loader.options)
    }

    return content
  }

  // Process all fies in queue
  processFileQueue() {
    // Process remaining files in queue
    while (this.files.length > 0) {
      // Get loaders for file given path
      const path = this.files.shift()
      const loaders = this.getLoaders(path)

      // Continue if no loaders match
      if (loaders === null)
        continue

      // If loader has raw property, load content as buffer instead of string
      const encoding = loaders[0].loader.raw ? null : 'utf8'
      const content = fs.readFileSync(path, { encoding })

      // Process file with loaders
      this.processFile(content, loaders)
    }
  }
}

module.exports = function(config, options) {
  return new EleventyLoad(config, options)
}
