import { createRoot } from "react-dom/client";
import SideDrawer from "./components/SideDrawer";
import { attachTwindStyle } from "@root/src/shared/style/twind";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
const root = document.createElement("div");
root.id = "steam-workshop-helper";

document.body.append(root);
const shadowRoot = root.attachShadow({ mode: "open" });

const rootIntoShadow = document.createElement("div");
rootIntoShadow.id = "shadow-root";

shadowRoot.appendChild(rootIntoShadow);
attachTwindStyle(rootIntoShadow, shadowRoot);

function App() {
  return (
    <StyleProvider container={shadowRoot} cache={createCache()}>
      {/* <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Popover: {
              zIndexPopup: 999,
            },
            Tree: {
              nodeSelectedBg: "red",
            },
          },
        }}
      > */}
      <div>
        <SideDrawer />
      </div>
      {/* </ConfigProvider> */}
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
