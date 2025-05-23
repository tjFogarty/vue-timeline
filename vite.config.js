import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'VueTimeline',
      fileName: (format) => `vue-timeline.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
        },
      },
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'pinia': 'pinia/dist/pinia.esm-browser.js',
    }
  },
});
