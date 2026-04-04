import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to add prefetch hints for lazy-loaded chunks
function prefetchLazyChunks() {
  return {
    name: 'prefetch-lazy-chunks',
    transformIndexHtml(html, { bundle }) {
      if (!bundle) return html;
      const ghostChunk = Object.keys(bundle).find(k => k.includes('Ghost'));
      const links = [];
      if (ghostChunk) {
        links.push({
          tag: 'link',
          attrs: { rel: 'prefetch', href: '/' + ghostChunk },
          injectTo: 'head',
        });
      }
      return links;
    },
  };
}

export default defineConfig({
  plugins: [react(), prefetchLazyChunks()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
