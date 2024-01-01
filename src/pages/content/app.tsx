import { createRoot } from "react-dom/client";
import SideDrawer from "./components/SideDrawer";
import { attachTwindStyle } from "@root/src/shared/style/twind";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
import injectedStyle from "./injected.css?inline";
import { GlobalContext } from "./context";
import { useEffect } from "react";
import { getLocalStorage } from "./utils";
import { useTranslation } from "react-i18next";
import zh from "antd/locale/zh_CN";
import en from "antd/locale/en_US";
import "./i18n";

function switchLang(lang: string) {
  let langData = zh;
  switch (lang) {
    case "en":
      langData = en;
      break;
    default:
      break;
  }
  return langData;
}

const root = document.createElement("div");
root.id = "steam-workshop-helper";

document.body.append(root);
const shadowRoot = root.attachShadow({ mode: "open" });

const rootIntoShadow = document.createElement("div");
rootIntoShadow.id = "shadow-root";

shadowRoot.appendChild(rootIntoShadow);
attachTwindStyle(rootIntoShadow, shadowRoot);
attachTwindStyle(document.querySelector("body"), document);
const styleElement = document.createElement("style");
styleElement.innerHTML = injectedStyle;
shadowRoot.appendChild(styleElement);
function App() {
  const { t, i18n } = useTranslation();
  const lang = getLocalStorage("i18nextLng");
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, []);
  return (
    <StyleProvider container={shadowRoot}>
      <GlobalContext.Provider value={{ root: rootIntoShadow }}>
        <ConfigProvider
          locale={switchLang(lang)}
          getPopupContainer={() => rootIntoShadow}
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Popover: {
                zIndexPopup: 999,
              },
            },
          }}
        >
          <div>
            <SideDrawer />
          </div>
        </ConfigProvider>
      </GlobalContext.Provider>
    </StyleProvider>
  );
}
/**
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

createRoot(rootIntoShadow).render(<App />);
