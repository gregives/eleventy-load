const emitFile = require("./emitFile");

describe("emitFile", () => {
  const shouldEmitFile = false;
  const content = "content";
  const mockedThis = {
    context: {
      resourcePath: "path/to/dir/test.foo",
    },
  };

  test.each([
    ["no-replacements", "no-replacements"],
    ["[dir]", "path/to/dir"],
    ["[name]", "test"],
    ["[ext]", "foo"],
    ["[hash]", "9a0364b9"], // default 8 chars
    ["[hash:32]", "9a0364b9e99bb480dd25e1f0284c8555"],
    [
      "prefix-dir/[dir]/[name]-[hash:8].[ext]",
      "prefix-dir/path/to/dir/test-9a0364b9.foo",
    ],
  ])("Returns expected filepath for pattern %p", (pathPattern, expected) => {
    const filepath = emitFile.apply(mockedThis, [
      content,
      pathPattern,
      shouldEmitFile,
    ]);

    expect(filepath).toBe(expected);
  });

  // No test for `shouldEmitFile=true`; could mock `fs` if necessary
});
