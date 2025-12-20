import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom")
    }
  },
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  },
  define: {
    'process.env': {},
    'process.cwd': {}
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, '')
    },
    '/auth': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
});