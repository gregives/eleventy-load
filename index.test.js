const plugin = require("./index");
const EleventyLoad = require("./EleventyLoad");
const createConfig = require("./utils/createConfig");
const eleventyMocks = require("./testUtils/eleventyMocks");

jest.mock("./EleventyLoad");
jest.mock("./utils/createConfig");

describe("eleventy-load plugin", () => {
  const { inputDir, outputDir, outputPath } = eleventyMocks.getValues();

  const rules = [{ test: /\.html$/, loaders: [] }];

  const mockConfig = {
    addTransform: jest.fn(),
    addShortcode: jest.fn(),
    on: jest.fn(),
  };

  class StubEleventyLoad {}

  // Eleventy interface pre v1.0.0
  const mockEleventyContext = eleventyMocks.v0_x_x();

  const mockCreatedConfig = {
    transform: () => ({ inputDir, outputDir }),
    shortcode: () => ({ inputDir, outputDir }),
  };

  beforeEach(() => {
    EleventyLoad.mockReturnValue(StubEleventyLoad);
    createConfig.mockReturnValue(mockCreatedConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Adds the `eleventy-load` transform", () => {
    plugin(mockConfig, { rules });

    const { addTransform } = mockConfig;

    expect(addTransform).toBeCalledTimes(1);
    expect(addTransform).toBeCalledWith("eleventy-load", expect.any(Function));

    const callback = addTransform.mock.calls[0][1];
    expect(callback.length).toBe(2);
  });

  test("Returns an EleventyLoad instance on transform", () => {
    const content = ["content"];
    const resource = "template.ejs"; //  relative to inputDir

    plugin(mockConfig, { rules });

    const callback = mockConfig.addTransform.mock.calls[0][1];
    callback.apply(mockEleventyContext, [content, outputPath]);

    expect(EleventyLoad).toBeCalledTimes(1);
    expect(EleventyLoad).toBeCalledWith(
      { rules },
      {}, // empty cache
      resource,
      content,
      mockCreatedConfig,
      outputPath
    );
  });

  test("Adds the `load` shortcode", () => {
    plugin(mockConfig, { rules });

    const { addShortcode } = mockConfig;

    expect(addShortcode).toBeCalledTimes(1);
    expect(addShortcode).toBeCalledWith("load", expect.any(Function));

    const callback = addShortcode.mock.calls[0][1];
    expect(callback.length).toBe(1);
  });

  test("Returns an EleventyLoad instance on shortcode `load`", () => {
    const resource = "resource";
    plugin(mockConfig, { rules });

    const callback = mockConfig.addShortcode.mock.calls[0][1];
    callback.apply(mockEleventyContext, [resource]);

    expect(EleventyLoad).toBeCalledTimes(1);
    expect(EleventyLoad).toBeCalledWith(
      { rules },
      {}, // empty cache
      resource,
      null,
      mockCreatedConfig,
      null
    );
  });

  test("Adds a cache reset on beforeWatch event", () => {
    plugin(mockConfig, { rules });

    const { on } = mockConfig;

    expect(on).toBeCalledTimes(1);
    expect(on).toBeCalledWith("beforeWatch", expect.any(Function));

    const callback = on.mock.calls[0][1];
    expect(callback.length).toBe(0);

    // Cannot test internal cache state
  });
});