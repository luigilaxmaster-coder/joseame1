import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { getViteConfig } from '@wix/vite-plugin';

const viteConfig = getViteConfig();

export default defineConfig({
  integrations: [react()],
  vite: {
    ...viteConfig,
    build: {
      ...(viteConfig.build || {}),
      rollupOptions: {
        ...(viteConfig.build?.rollupOptions || {}),
        external: ['wix-data', 'wix-members-backend'],
      },
    },
  },
});
