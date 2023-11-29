import { createRoot } from "react-dom/client";
import SideDrawer from "./components/SideDrawer";
import "./style.scss";
import { attachTwindStyle } from "@root/src/shared/style/twind";
const root = document.createElement("div");
root.id = "steam-workshop-helper";

document.body.append(root);
attachTwindStyle(root, document);
function App() {
  return (
    <div>
      <SideDrawer />
    </div>
  );
}
createRoot(root).render(<App />);
