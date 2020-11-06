const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const hashContent = (content, length) =>
  crypto.createHash("md5").update(content).digest("hex").slice(0, length);

module.exports = function (content, filepath, emitFile = true) {
  const { ext, name } = path.parse(this.context.resource);

  // Placeholder values to replace
  const replacements = [
    {
      test: /\[name]/g,
      replace: name,
    },
    {
      test: /\[ext]/g,
      replace: ext.slice(1),
    },
    {
      test: /\[hash(?::(\d+))?]/g,
      replace: (_, length) => hashContent(content, Number(length) || 8),
    },
  ];

  // Replace all placeholder values
  replacements.forEach(({ test, replace }) => {
    filepath = filepath.replace(test, replace);
  });

  if (emitFile) {
    // Ensure directory exists
    const { dir } = path.parse(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Write contents to filepath
    fs.writeFileSync(path.resolve(filepath), content);
  }

  return filepath;
};
