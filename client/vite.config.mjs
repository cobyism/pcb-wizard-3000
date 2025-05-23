import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // use backend when inside docker
      "/api":
        process.env.NODE_ENV === "production"
          ? {
              target: "http://backend:4000",
              changeOrigin: true,
            }
          : {
              target: "http://localhost:4000",
              changeOrigin: true,
            },
    },
  },
});
