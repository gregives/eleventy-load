const createConfig = require("./createConfig");
const {
  mockValues,
  mockTransform,
  mockShortcode,
} = require("../testUtils/eleventyMock");

describe.each(["v0_x_x", "v1_x_x"])(
  "createConfig (11ty %s)",
  (eleventyVersion) => {
    const mockConfig = { _mockedConfigProp: true };

    test("Returns expected config for `transform`", () => {
      const mockEleventyContext = mockTransform[eleventyVersion]();

      const result = createConfig("transform", mockConfig, mockEleventyContext);

      expect(result).toEqual({
        inputDir: mockValues.inputDir,
        outputDir: mockValues.outputDir,
        _mockedConfigProp: true,
      });
    });

    test("Returns expected config for `shortcode`", () => {
      const mockEleventyContext = mockShortcode[eleventyVersion]();

      const result = createConfig("shortcode", mockConfig, mockEleventyContext);

      expect(result).toEqual({
        inputDir: mockValues.inputDir,
        outputDir: mockValues.outputDir,
        _mockedConfigProp: true,
      });
    });
  }
);
