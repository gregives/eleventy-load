const createConfig = require("./createConfig");
const {
  mockValues,
  mockTransform,
  mockShortcode,
} = require("../testUtils/eleventyMock");

describe("createConfig", () => {
  const mockConfig = { _mockedConfigProp: true };

  test("Returns expected config for `transform`", () => {
    const mockEleventyContext = mockTransform.v0_x_x();

    const result = createConfig("transform", mockConfig, mockEleventyContext);

    expect(result).toEqual({
      inputDir: mockValues.inputDir,
      outputDir: mockValues.outputDir,
      _mockedConfigProp: true,
    });
  });

  test("Returns expected config for `shortcode`", () => {
    const mockEleventyContext = mockShortcode.v0_x_x();

    const result = createConfig("shortcode", mockConfig, mockEleventyContext);

    expect(result).toEqual({
      inputDir: mockValues.inputDir,
      outputDir: mockValues.outputDir,
      _mockedConfigProp: true,
    });
  });
});
