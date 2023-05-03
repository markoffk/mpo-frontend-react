import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
                type: 'module',
            },
            srcDir: "src",
            filename: "service-worker.ts",
            strategies: "injectManifest",
            injectRegister: false,
            manifest: false,
            injectManifest: {
                injectionPoint: null,
            },
        }),
    ],
});
