# hide-applied-jobs-linkedin

[link-rgh]: https://github.com/sindresorhus/refined-github
[link-ngh]: https://github.com/sindresorhus/notifier-for-github
[link-hfog]: https://github.com/sindresorhus/hide-files-on-github
[link-tsconfig]: https://github.com/sindresorhus/tsconfig
[link-cws-keys]: https://github.com/fregante/chrome-webstore-upload-keys
[link-amo-keys]: https://addons.mozilla.org/en-US/developers/addon/api/key

A simple browser extension that hides jobs already applied to in the LinkedIn job search.

![Icon](source/icon.png)

## Features

- Hides jobs from your LinkedIn job search results, if you have already applied to them.
- Click the extension icon to configure settings:
  - **Action on matched jobs:** hide, highlight, or take no action
  - **Matching options:** applied jobs, or match by keywords

## Disclaimer

This extension is not affiliated with LinkedIn or any of its affiliates or subsidiaries. This is an independent and unofficial extension.

## Installation

- Chrome: Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/hide-applied-jobs-linkedi/jkoegkdeggghnoenfgjoklfkmihkighf).
- Firefox: Install from [Add-ons for Firefox](https://addons.mozilla.org/en-CA/firefox/addon/hide-applied-jobs-linkedin/).
- You can also download the [latest release](https://github.com/Robert01101101/hide-applied-jobs-linkedin/releases), and [load the extension manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi), or [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing).

## Template

- This browser extension used the [browser-extension-template](https://github.com/fregante/browser-extension-template) as a starting point for development.
- The below information is not relevant if you would only like to install and use this extension. It is for software development purposes.

### Development

#### Get Started

1. Checkout the copied repository to your local machine eg. with `git clone https://github.com/potato-robert/hide-applied-jobs-linkedin/`
1. Run `npm install` to install all required dependencies
1. Run `npm run build` to build to `distribution/`
1. The extension can now be [loaded manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi).

#### Commands

- `npm test` — runs the full suite: lint, build, unit tests, and extension validation (`web-ext lint`)
- `npm run lint-fix` — auto-fix lint issues where possible
- `npm run test:unit` — run unit tests only
- `npm run build` — build the extension to `distribution/`
- `npm run watch` — watch for file changes and build continuously

## Support me

This extension is free, and there is no need to pay me. But if it helps you, I appreciate a coffee :)

<a href="https://www.buymeacoffee.com/rmichels">
    <img src="media/bmc-button.png" style="width: 150px; height: auto;" alt="Buy Me A Coffee">
</a>
