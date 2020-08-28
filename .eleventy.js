class EleventyLoad {
  constructor(config, options) {
    this.config = config
    this.options = options
    this.files = []

    // Transform is our entry point
    config.addTransform('eleventy-load', this.start.bind(this))
  }

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

  getLoaders(path) {
    // Find which rule matches the given path
    const applicableRule = this.options.rules.find((rule) => rule.test.test(path))

    // Return loaders if they exist or null
    return applicableRule === undefined ? null : applicableRule.loaders
  }

  processFile(content, loaders) {
    // Apply loaders to content in order
    for (const loader of loaders) {
      content = loader.loader(content, loader.options)
    }

    return content
  }

  processFileQueue() {
    // Process remaining files in queue
    while (this.files.length > 0) {
      // Get loaders for file given path
      const path = this.files.shift()
      loaders = this.getLoaders(path)

      // Continue if no loaders match
      if (loaders === null)
        continue

      // Get type of encoding for file from first loader
      const encoding = loaders[0].loader.encoding
      const content = fs.readFileSync(path, { encoding })

      // Process file with loaders
      this.processFile(content, loaders)
    }
  }
}

module.exports = function(config, options) {
  return new EleventyLoad(config, options)
}
