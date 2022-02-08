const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const hashContent = (content, length) =>
  crypto.createHash("md5").update(content).digest("hex").slice(0, length);

module.exports = function (content, filepath, shouldEmitFile = true) {
  const { dir, ext, name } = path.parse(this.context.resourcePath);

  // Placeholder values to replace
  const replacements = [
    {
      test: /\[dir]/g,
      replace: dir,
    },
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

  if (shouldEmitFile) {
    // Ensure directory exists
    const { dir } = path.parse(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Write contents to filepath
    fs.writeFileSync(path.resolve(filepath), content);
  }

  return filepath;
};
