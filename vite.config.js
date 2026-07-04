import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import commonjs from 'vite-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), commonjs()],
  resolve: {
    alias: {
      ws: '../util/shim/WebSocket',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['roslib'],
  },
});
