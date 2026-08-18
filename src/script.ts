/* ==========================================================
   BLUE LAGOON CASINO — site TypeScript
   Only two small things happen here:
   1) the 18+ age gate
   2) the mobile hamburger menu

   NOTE: do not edit the .js file in the js/ folder — it is
   generated from this file. Edit this one, then run:  npm run build
   ========================================================== */

/* A tiny helper.

   In plain JavaScript, document.getElementById() might hand you back
   an element OR null (if nothing on the page has that id), and nothing
   warns you. TypeScript makes that possible-null explicit, so this
   helper does the checking once instead of at every single use. */
function findElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}


/* ---------- 1. AGE GATE (18+) ----------
   Shows once. After the visitor confirms, the browser remembers
   the answer so the pop-up does not appear on every page. */
(function initAgeGate(): void {
  const gate: HTMLElement | null = findElement('ageGate');
  const yesButton: HTMLButtonElement | null = findElement<HTMLButtonElement>('ageYes');

  if (!gate || !yesButton) return;          // this page has no age gate

  // Already confirmed earlier? Hide immediately.
  if (localStorage.getItem('blueLagoonAgeOk') === 'yes') {
    gate.hidden = true;
    return;
  }

  // Stop the page behind from scrolling while the gate is open
  document.body.style.overflow = 'hidden';

  yesButton.addEventListener('click', (): void => {
    localStorage.setItem('blueLagoonAgeOk', 'yes');
    gate.hidden = true;
    document.body.style.overflow = '';
  });
})();


/* ---------- 2. MOBILE MENU ----------
   The ☰ button shows/hides the navigation on small screens. */
(function initMobileMenu(): void {
  const toggle: HTMLButtonElement | null = findElement<HTMLButtonElement>('navToggle');
  const links: HTMLUListElement | null = findElement<HTMLUListElement>('navLinks');

  if (!toggle || !links) return;

  toggle.addEventListener('click', (): void => {
    links.classList.toggle('open');
  });

  // Close the menu after tapping a link
  links.addEventListener('click', (event: MouseEvent): void => {
    // event.target is typed as EventTarget, which has no .tagName —
    // this check tells TypeScript it is really an element.
    const target = event.target;
    if (target instanceof HTMLElement && target.tagName === 'A') {
      links.classList.remove('open');
    }
  });
})();
