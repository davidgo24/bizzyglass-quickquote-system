import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // This is why allowedHosts is now required
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // Using IP to avoid localhost resolution issues
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '604b247191dd.ngrok-free.app' // <--- IMPORTANT: UPDATED NGROK HOSTNAME (no protocol)
    ]
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
