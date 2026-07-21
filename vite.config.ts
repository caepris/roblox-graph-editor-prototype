import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On build we serve from a GitHub Pages project subpath
// (https://<user>.github.io/roblox-graph-editor-prototype/); dev stays at root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/roblox-graph-editor-prototype/' : '/',
}));
