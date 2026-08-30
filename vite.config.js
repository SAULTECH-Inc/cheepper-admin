import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    host: true,
    strictPort: true, // fail fast if 5177 is already taken
  },
});
