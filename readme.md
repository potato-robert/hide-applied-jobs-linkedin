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

- Identifies jobs in LinkedIn job search results and hides or highlights them based on your settings.
- Click the extension icon to configure settings:
  - **Action on matched jobs:** hide, highlight, or take no action
  - **Highlight color:** pick a custom color when using highlight mode
  - **Matching options:** independently enable matching for:
    - Jobs you have already applied to
    - Jobs containing your keywords (comma-separated, e.g. Promoted, Remote)
  - **Case-insensitive keyword filtering**
- Shows a badge on the extension icon with the number of matched jobs on the current tab.

## Disclaimer

This extension is not affiliated with LinkedIn or any of its affiliates or subsidiaries. This is an independent and unofficial extension.

## Installation

- Chrome: Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/hide-applied-jobs-linkedi/jkoegkdeggghnoenfgjoklfkmihkighf).
- Firefox: Install from [Add-ons for Firefox](https://addons.mozilla.org/en-CA/firefox/addon/hide-applied-jobs-linkedin/).
- You can also download the [latest release](https://github.com/Robert01101101/hide-applied-jobs-linkedin/releases), and [load the extension manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi), or [Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing).

## Template

- This browser extension used the [browser-extension-template](https://github.com/fregante/browser-extension-template) as a starting point for development.
- The below information is not relevant if you would only like to install and use this extension. It is for software development purposes.

### Getting started

#### 🛠 Build locally

1. Checkout the copied repository to your local machine eg. with `git clone https://github.com/Robert01101101/hide-applied-jobs-linkedin/`
1. Run `npm install` to install all required dependencies
1. Run `npm run build`
1. The extension can now be [loaded manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi).

The build step will create the `distribution` folder, this folder will contain the generated extension.

#### 🏃 Run the extension

Using [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) is recommended for automatic reloading and running in a dedicated browser instance. Alternatively you can load the extension manually (see below).

1. Run `npm run watch` to watch for file changes and build continuously
1. Run `npm install --global web-ext` (only only for the first time)
1. If you're using `web-ext`: In another terminal, run `web-ext run -t chromium`

## Support me

This extension is free, and there is no need to pay me. But if it helps you, I appreciate a coffee :)

<a href="https://www.buymeacoffee.com/rmichels">
    <img src="media/bmc-button.png" style="width: 150px; height: auto;" alt="Buy Me A Coffee">
</a>
