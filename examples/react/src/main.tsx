import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonnerContainer } from "mini-sonner";

// Fonts
import "@fontsource-variable/inter";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";

import "mini-sonner/styles.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SonnerContainer autoClose={3000} closeButton={true} theme="light">
      <App />
    </SonnerContainer>
  </StrictMode>
);
