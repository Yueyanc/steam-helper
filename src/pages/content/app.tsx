import { createRoot } from "react-dom/client";
import FloatPanel from "./components/FloatPanel";
const root = document.createElement("div");
root.id = "steam-workshop-helper";

document.body.append(root);
function App() {
  return (
    <div>
      <FloatPanel />
    </div>
  );
}
createRoot(root).render(<App />);
