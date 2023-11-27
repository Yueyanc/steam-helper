import type { PluginOption } from "vite";
import { readFileSync } from "fs";
import * as path from "path";
type Config = {
  cssKey: string;
};
function getInjectionCode(fileName: string): string {
  return readFileSync(
    path.resolve(__dirname, "..", "reload", "injections", fileName),
    { encoding: "utf8" }
  );
}
export default function AutoImportCss({ cssKey = "" }: Config): PluginOption {
  return {
    name: "auto-import-css",
    load(id) {
      if (id.includes("/pages/content/index.ts")) {
        return (
          getInjectionCode(id) +
          "\n" +
          "var link = document.createElement('link');" +
          "link.href = chrome.runtime.getURL(" +
          `'assets/css/contentStyle${cssKey}.chunk.css'` +
          ");" +
          "link.type = 'text/css';" +
          "link.rel = 'stylesheet';" +
          "document.getElementsByTagName('head')[0].appendChild(link);"
        );
      }
    },
  };
}
