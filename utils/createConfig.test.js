const createConfig = require("./createConfig");
const eleventyMocks = require("../testUtils/eleventyMocks");

describe("createConfig", () => {
  const mockConfig = { _mockedConfigProp: true };

  // Eleventy interface pre v1.0.0
  const mockEleventyContext = eleventyMocks.v0_x_x();

  test("Returns expected config for `transform`", () => {
    const result = createConfig("transform", mockConfig, mockEleventyContext);

    expect(result).toEqual({
      inputDir: "test/some/",
      outputDir: "dist",
      _mockedConfigProp: true,
    });
  });

  test("Returns expected config for `shortcode`", () => {
    const result = createConfig("shortcode", mockConfig, mockEleventyContext);

    expect(result).toEqual({
      inputDir: "test",
      outputDir: ".",
      _mockedConfigProp: true,
    });
  });
});
