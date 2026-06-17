/* eslint-disable no-undef */
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (command === "serve" && process.env.NODE_ENV !== "development") {
    process.env.NODE_ENV = "development"
  }

  return {
    plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      cors: true,
    },
    build: {
      chunkSizeWarningLimit: 1600,
      cssMinify: true,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('firebase')) {
              return 'firebase-bundle';
            }
            if (id.includes('@embedpdf') || id.includes('pdfjs-dist')) {
              return 'pdf-viewer';
            }
            if (id.includes('libphonenumber-js') || id.includes('country-data-list') || id.includes('lodash') || id.includes('date-fns')) {
              return 'heavy-utils';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('lenis') || id.includes('@radix-ui')) {
              return 'ui-frameworks';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
  }
})
