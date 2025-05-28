import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConvexClientProvider } from "./lib/convex";

createRoot(document.getElementById("root")!).render(
  <ConvexClientProvider>
    <App />
  </ConvexClientProvider>
);
