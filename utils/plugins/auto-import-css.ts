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
  };
}
