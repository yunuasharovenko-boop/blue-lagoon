/* ==========================================================
   LINK HELPER
   ----------------------------------------------------------
   The site lives in a sub-folder on GitHub Pages:

     https://yunuasharovenko-boop.github.io/blue-lagoon/

   so every internal link has to start with /blue-lagoon.
   Astro gives us that prefix in import.meta.env.BASE_URL, but
   WITHOUT a trailing slash — so writing BASE_URL + 'games'
   produces "/blue-lagoongames", which is broken.

   This helper joins the two halves properly. Use url('games')
   for links and url() on its own for the home page.
   ========================================================== */

/** The site prefix with any trailing slashes stripped off. */
const BASE: string = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Build an internal link.
 *
 *   url()                  →  /blue-lagoon/
 *   url('games')           →  /blue-lagoon/games
 *   url('#play')           →  /blue-lagoon/#play
 *   url('images/pic.png')  →  /blue-lagoon/images/pic.png
 */
export function url(path: string = ''): string {
  const clean = path.replace(/^\/+/, '');
  return clean === '' ? `${BASE}/` : `${BASE}/${clean}`;
}
