import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom")) {
              return "router";
            }
            if (id.includes("recharts")) {
              return "charts";
            }
            if (id.includes("react-helmet-async")) {
              return "helmet";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
