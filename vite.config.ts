import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three/webgpu"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: { strictPort: true },
  preview: { strictPort: true },
});
