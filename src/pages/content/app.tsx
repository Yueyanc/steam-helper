import { createRoot } from "react-dom/client";
import SideDrawer from "./components/SideDrawer";
import "./style.scss";
const root = document.createElement("div");
root.id = "steam-workshop-helper";

document.body.append(root);
function App() {
  return (
    <div>
      <SideDrawer />
    </div>
  );
}
createRoot(root).render(<App />);
