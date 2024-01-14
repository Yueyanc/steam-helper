import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  permissions: ["tabs"],
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-48.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  externally_connectable: {
    matches: [
      "https://steamcommunity.com/*",
      "https://store.steampowered.com/*",
    ],
  },
  content_scripts: [
    {
      matches: [
        "https://steamcommunity.com/*",
        "https://store.steampowered.com/*",
      ],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: ["assets/css/contentStyle<KEY>.chunk.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-48.png",
      ],
      matches: [
        "https://steamcommunity.com/*",
        "https://store.steampowered.com/*",
      ],
    },
  ],
};

export default manifest;
