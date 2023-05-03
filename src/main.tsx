import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import "./global.css";
import { App } from "./App";

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register(
//         import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw'
//     )
// }

export const muiTheme = createTheme({
    palette: {
        primary: {
            main: "#0063af",
        },
    },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
