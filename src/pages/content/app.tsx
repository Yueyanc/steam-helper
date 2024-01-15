import { createRoot } from "react-dom/client";
import SideDrawer from "./components/SideDrawer";
import { attachTwindStyle } from "@root/src/shared/style/twind";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
import injectedStyle from "./injected.css?inline";
import { GlobalContext } from "./context";
import { useEffect, useMemo, useState } from "react";
import { getLocalStorage } from "./utils";
import { useTranslation } from "react-i18next";
import zh from "antd/locale/zh_CN";
import en from "antd/locale/en_US";
import "./i18n";
import InjectPrices from "./components/Prices";
import { ConfigProviderProps } from "antd/es/config-provider";
import _ from "lodash";

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

interface Props {
  children: any;
}
export const AntdConfigProvider: React.FC<ConfigProviderProps & Props> = ({
  children,
  ...props
}) => {
  const [lang, setLang] = useState("zh");
  const defaultProps = {
    getPopupContainer: () => rootIntoShadow,
    theme: {
      algorithm: theme.darkAlgorithm,
      components: {
        Popover: {
          zIndexPopup: 999,
        },
      },
    },
  };
  useEffect(() => {
    chrome.i18n.getAcceptLanguages((langs) => {
      setLang(langs?.[0]?.split("-")?.[0] ?? "zh");
    });
  }, []);
  const mergedProps = useMemo(
    () => _.merge(defaultProps, props, { locale: lang }),
    [props, lang]
  );
  return <ConfigProvider {...mergedProps}>{children}</ConfigProvider>;
};

function App() {
  return (
    <StyleProvider container={shadowRoot}>
      <GlobalContext.Provider value={{ root: rootIntoShadow }}>
        <AntdConfigProvider>
          <div>
            {window.location.href.startsWith(
              "https://steamcommunity.com/app/"
            ) && <SideDrawer />}
            {window.location.href.startsWith(
              "https://store.steampowered.com/app"
            ) && <InjectPrices />}
          </div>
        </AntdConfigProvider>
      </GlobalContext.Provider>
    </StyleProvider>
  );
}

createRoot(rootIntoShadow).render(<App />);
