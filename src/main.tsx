import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import './global.css'
import App from "./App";

export const muiTheme = createTheme({
palette: {
    primary: {
        main: '#0063af'
    }
}
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
