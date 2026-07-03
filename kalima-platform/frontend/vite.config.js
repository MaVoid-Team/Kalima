/* eslint-disable no-undef */
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import { defineConfig, loadEnv } from "vite"

const normalizeProxyTarget = (value) => {
  const target = String(value || "")
  if (!/^https?:\/\//.test(target)) return "http://localhost:5001"
  return target.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "")
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "serve" && process.env.NODE_ENV !== "development") {
    process.env.NODE_ENV = "development"
  }

  const env = loadEnv(mode, process.cwd(), "")
  const apiProxyTarget = normalizeProxyTarget(env.VITE_API_PROXY_TARGET || process.env.VITE_API_PROXY_TARGET)

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
          target: apiProxyTarget,
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
            if (!id.includes('node_modules')) return undefined;

            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'firebase-bundle';
            }
            if (id.includes('/pdfjs-dist/')) {
              return 'pdfjs';
            }
            if (id.includes('/@embedpdf/engines/') || id.includes('/@embedpdf/pdfium/') || id.includes('/@embedpdf/fonts-')) {
              return 'embedpdf-engine';
            }
            if (id.includes('/@embedpdf/plugin-')) {
              return 'embedpdf-plugins';
            }
            if (id.includes('/@embedpdf/react-pdf-viewer/')) {
              return 'embedpdf-react';
            }
            if (id.includes('/@embedpdf/core/')) {
              return 'embedpdf-core';
            }
            if (id.includes('/@embedpdf/models/')) {
              return 'embedpdf-models';
            }
            if (id.includes('/@embedpdf/utils/')) {
              return 'embedpdf-utils';
            }
            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router-dom/')
            ) {
              return 'react-vendor';
            }
            if (id.includes('/@radix-ui/')) {
              return 'radix-ui';
            }
            if (id.includes('/framer-motion/') || id.includes('/lucide-react/') || id.includes('/lenis/')) {
              return 'ui-libs';
            }
            if (id.includes('/libphonenumber-js/') || id.includes('/country-data-list/') || id.includes('/lodash/') || id.includes('/date-fns/')) {
              return 'utility-libs';
            }
          }
        }
      }
    },
  }
})
