// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Your live address on GitHub Pages. These two lines are what make
  // links work under the /blue-lagoon/ folder instead of the site root.
  // If you ever move to your own domain, set site to that domain and
  // delete the base line.
  site: 'https://yunuasharovenko-boop.github.io',
  base: '/blue-lagoon',

  // Build plain HTML files that any web host can serve — no server needed.
  output: 'static',

  build: {
    // Produces games/index.html rather than games.html, so the address
    // is /blue-lagoon/games/ and stays tidy.
    format: 'directory',
  },
});
