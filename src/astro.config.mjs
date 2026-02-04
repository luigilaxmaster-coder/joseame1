import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { getViteConfig } from '@wix/vite-plugin';

export default defineConfig({
  integrations: [react()],
  vite: {
    ...getViteConfig(),
    build: {
      rollupOptions: {
        external: ['wix-data', 'wix-members-backend'],
      },
    },
  },
});
