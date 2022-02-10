# eleventy-load ⚡

![Tests](https://github.com/gregives/eleventy-load/actions/workflows/test.yml/badge.svg)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Prettier][prettier-src]][prettier-href]

Wish there was a way to import Sass files as easily as CSS files? Now there is!

Introducing eleventy-load, an [Eleventy](https://11ty.dev/) plugin which resolves dependencies and post-processes files for you. Loading Sass files is just one example: eleventy-load exposes 'loaders' which can process **any file** including HTML, CSS, JavaScript, images and more. The concept of eleventy-load is very similar to [webpack loaders](https://webpack.js.org/loaders/), albeit with infinitely less JavaScript sent to the browser.

## [Documentation][eleventy-load-index]

Visit the [eleventy-load website][eleventy-load-index] for usage instructions, examples of eleventy-load, a list of loaders and how to write a loader yourself.

## Get Started

For more detailed instructions, see the [eleventy-load website][eleventy-load-usage].

The following example sets up eleventy-load so that you can import Sass files just like you would import CSS files.

1. Install eleventy-load and any loaders you need.

```sh
npm install --save-dev eleventy-load eleventy-load-html eleventy-load-sass eleventy-load-css eleventy-load-file
```

2. Add eleventy-load as a plugin and set up rules to process your Sass file.

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(require("eleventy-load"), {
    rules: [
      {
        test: /\.html$/,
        loaders: [
          {
            loader: require("eleventy-load-html"),
          },
        ],
      },
      {
        test: /\.scss$/,
        loaders: [
          {
            loader: require("eleventy-load-sass"),
          },
          {
            loader: require("eleventy-load-css"),
          },
          {
            loader: require("eleventy-load-file"),
            options: {
              name: "[hash].css",
            },
          },
        ],
      },
    ],
  });
};
```

3. Now you can write your Sass in a file and link it in your HTML using a `link` element!

```scss
$massive: 5rem;

body {
  background-color: linen;

  h1 {
    font-size: $massive;
  }
}
```

```html
<link rel="stylesheet" href="styles.scss" />
```

It's as easy as that!

## Loaders

Loaders can process any file, from a text file to images. See a list of loaders on the [eleventy-load website][eleventy-load-loaders].

## Contribution

I'd love some help adding tests to eleventy-load and growing the ecosystem of loaders. If you'd like to contribute, get in touch with me!

### Development

- Clone this repo and run `npm install`
- Configure your IDE to run prettier/eslint on save.
- Run `npm run test:watch` which will run tests on changed files while you work.
- Please add tests for any new features. Run `npm test` to lint, run tests and get a coverage report.
- Tests will run when you push to remote

It's a pain to manually test changes against a running 11ty instance, especially for different versions. The tests make this simpler by mocking the interface to 11ty for each major version. This gives reasonable confidence that the plugin is compatible with each major 11ty release.


<!-- References -->

[eleventy-load-index]: https://eleventy-load.xyz/
[eleventy-load-usage]: https://eleventy-load.xyz/usage/
[eleventy-load-loaders]: https://eleventy-load.xyz/loaders/
[npm-version-src]: https://img.shields.io/npm/v/eleventy-load/latest.svg
[npm-version-href]: https://npmjs.com/package/eleventy-load
[npm-downloads-src]: https://img.shields.io/npm/dt/eleventy-load.svg
[npm-downloads-href]: https://npmjs.com/package/eleventy-load
[license-src]: https://img.shields.io/npm/l/eleventy-load.svg
[license-href]: https://npmjs.com/package/eleventy-load
[prettier-src]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-href]: https://github.com/prettier/prettier
