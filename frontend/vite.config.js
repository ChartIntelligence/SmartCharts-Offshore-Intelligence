import {
  defineConfig
} from "vite";

import react from
  "@vitejs/plugin-react";


export default defineConfig({
  // Shared modules must use the frontend's installed Temporal dependency.
  resolve: {
    dedupe: ["@js-temporal/polyfill"]
  },
  plugins: [
    react()
  ],

  server: {
    host: true,

    proxy: {
      "/api": {
        target:
          "http://localhost:8787",

        changeOrigin: true
      }
    }
  }
});