import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://169.233.186.58:5000", // Replace with the correct server IP and port
        changeOrigin: true, // Ensures the server sees the request as coming from the frontend
        secure: false, // Set to false if using an HTTP server instead of HTTPS
      },
    },
  },
});
