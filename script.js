/* ==========================================================
   BLUE LAGOON CASINO — site JavaScript
   Only two small things happen here:
   1) the 18+ age gate
   2) the mobile hamburger menu
   ========================================================== */

/* ---------- 1. AGE GATE (18+) ----------
   Shows once. After the visitor confirms, the browser remembers
   the answer so the pop-up does not appear on every page. */
(function () {
  var gate = document.getElementById('ageGate');
  if (!gate) return;                      // this page has no age gate

  // Already confirmed earlier? Hide immediately.
  if (localStorage.getItem('blueLagoonAgeOk') === 'yes') {
    gate.hidden = true;
    return;
  }

  // Stop the page behind from scrolling while the gate is open
  document.body.style.overflow = 'hidden';

  document.getElementById('ageYes').addEventListener('click', function () {
    localStorage.setItem('blueLagoonAgeOk', 'yes');
    gate.hidden = true;
    document.body.style.overflow = '';
  });
})();


/* ---------- 2. MOBILE MENU ----------
   The ☰ button shows/hides the navigation on small screens. */
(function () {
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
  });

  // Close the menu after tapping a link
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });
})();
