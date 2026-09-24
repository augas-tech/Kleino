import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Puerto 5173 por defecto: coincide con el FRONTEND_ORIGINS
// que ya está configurado en el backend (config/initializers/cors.rb).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
