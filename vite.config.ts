import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          sevroll: path.resolve(__dirname, 'sevroll.html'),
          antaro: path.resolve(__dirname, 'antaro.html'),
          merivo: path.resolve(__dirname, 'merivo.html'),
          giecie: path.resolve(__dirname, 'giecie.html'),
          lamele: path.resolve(__dirname, 'lamele.html'),
          polki: path.resolve(__dirname, 'polki.html'),
          rogowa: path.resolve(__dirname, 'rogowa.html'),
          render: path.resolve(__dirname, 'render.html'),
          harmonogram: path.resolve(__dirname, 'harmonogram.html'),
          kalkulator: path.resolve(__dirname, 'kalkulator.html'),
          nesting: path.resolve(__dirname, 'nesting/index.html')
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
