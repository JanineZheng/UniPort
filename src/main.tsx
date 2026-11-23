import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import GuidePage from "./GuidePage";
import { guideFor } from "./config/guides";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {guideFor(window.location.pathname) ? <GuidePage /> : <App />}
  </StrictMode>,
);
