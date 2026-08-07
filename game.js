/* ==========================================================
   FRUIT FIESTA — demo slot machine
   ----------------------------------------------------------
   PLAY MONEY ONLY. No real money, no payments, nothing is
   sent anywhere. Credits are saved in your own browser.

   HOW IT WORKS, in short:
     1. Each reel picks one random symbol from the "strip".
     2. Three of a kind pays (see PAYS_3 below).
     3. Three 7s = the whole jackpot.
     4. Two matching symbols pay a small amount.
   ========================================================== */

(function () {

  /* ---------- SETTINGS you can safely change ---------- */

  // The reel strip. A symbol that appears more times here is
  // more likely to land. Add or remove entries to change the odds.
  //
  // Right now three 7s come up about once in 730 spins. To see the
  // jackpot animation without spinning that long, either add more
  // '7️⃣' entries here — or just press the J key (see the bottom of this file).
  var STRIP = ['🍒','🍒','🍋','🍋','🍊','🍉','🍇','🔔','7️⃣'];

  // Payout for THREE of the same symbol (multiplied by your bet)
  var PAYS_3 = { '🔔': 50, '🍇': 30, '🍉': 20, '🍊': 10, '🍋': 8, '🍒': 5 };

  // Payout for TWO of the same symbol. Anything not listed pays 1×.
  var PAYS_2 = { '7️⃣': 5, '🍒': 2 };

  var START_CREDITS  = 1000;   // credits a new player gets
  var START_JACKPOT  = 12480;  // jackpot when the page is opened for the first time
  var JACKPOT_AFTER  = 5000;   // jackpot resets to this after someone wins it
  var JACKPOT_SHARE  = 0.05;   // 5% of every bet goes into the jackpot pool
                               // (raising this makes the game pay out more
                               //  than it takes in — 0.05 is roughly break-even)
  var BETS           = [10, 20, 50, 100];  // available bet sizes


  /* ---------- FIND THE PAGE ELEMENTS ---------- */

  var elReels   = document.getElementById('reels');
  if (!elReels) return;              // not on this page — stop here

  var reels     = [document.getElementById('reel0'),
                   document.getElementById('reel1'),
                   document.getElementById('reel2')];
  var elJackpot = document.getElementById('jackpotValue');
  var elCredits = document.getElementById('creditsValue');
  var elBet     = document.getElementById('betValue');
  var elMessage = document.getElementById('slotMessage');
  var btnSpin   = document.getElementById('spinBtn');
  var btnUp     = document.getElementById('betUp');
  var btnDown   = document.getElementById('betDown');
  var btnReset  = document.getElementById('resetBtn');


  /* ---------- GAME STATE ---------- */

  var credits  = load('blCredits', START_CREDITS);
  var jackpot  = load('blJackpot', START_JACKPOT);
  var betIndex = 0;
  var spinning = false;

  function load(key, fallback) {
    var v = parseFloat(localStorage.getItem(key));
    return isNaN(v) ? fallback : v;
  }
  function save() {
    localStorage.setItem('blCredits', credits);
    localStorage.setItem('blJackpot', jackpot);
  }

  // Turn 1234.5 into "1,234.50"
  function money(n, decimals) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }


  /* ---------- DRAW THE CURRENT STATE ON SCREEN ---------- */

  function render() {
    elCredits.textContent = money(Math.floor(credits), 0);
    elBet.textContent     = money(BETS[betIndex], 0);
    elJackpot.textContent = money(jackpot, 2);

    btnDown.disabled = spinning || betIndex === 0;
    btnUp.disabled   = spinning || betIndex === BETS.length - 1;
    btnSpin.disabled = spinning;
    btnSpin.textContent = spinning ? 'SPINNING…' : 'SPIN';
  }

  function message(text, type) {
    elMessage.textContent = text;
    elMessage.className = 'slot-message' + (type ? ' ' + type : '');
  }


  /* ---------- THE JACKPOT TICKER ----------
     Grows slowly on its own, as if other players were betting.
     It makes the number feel alive. */
  setInterval(function () {
    jackpot += Math.random() * 3 + 0.4;
    elJackpot.textContent = money(jackpot, 2);
  }, 900);


  /* ---------- ONE SPIN ---------- */

  function randomSymbol() {
    return STRIP[Math.floor(Math.random() * STRIP.length)];
  }

  function spin() {
    if (spinning) return;

    var bet = BETS[betIndex];

    if (credits < bet) {
      message('Not enough credits — lower your bet or reset the demo', '');
      return;
    }

    // Take the bet, feed the jackpot
    credits -= bet;
    jackpot += bet * JACKPOT_SHARE;
    spinning = true;
    elReels.classList.remove('win', 'jackpot');
    message('Good luck…', '');
    render();

    // Decide the result now; the animation just reveals it
    var result = [randomSymbol(), randomSymbol(), randomSymbol()];

    // Spin each reel, stopping them one after another (left to right)
    reels.forEach(function (reel, i) {
      reel.classList.add('spinning');

      var flicker = setInterval(function () {
        reel.textContent = randomSymbol();
      }, 70);

      setTimeout(function () {
        clearInterval(flicker);
        reel.textContent = result[i];
        reel.classList.remove('spinning');
        reel.classList.add('land');
        setTimeout(function () { reel.classList.remove('land'); }, 320);

        // When the LAST reel stops, check the result
        if (i === reels.length - 1) finish(result, bet);
      }, 700 + i * 450);
    });
  }


  /* ---------- WHAT DID WE WIN? ---------- */

  function evaluate(r, bet) {
    // Three of a kind
    if (r[0] === r[1] && r[1] === r[2]) {
      if (r[0] === '7️⃣') return { kind: 'jackpot' };
      var m3 = PAYS_3[r[0]] || 1;
      return { kind: 'win', amount: m3 * bet, text: 'Three ' + r[0] + ' — ' + m3 + '×' };
    }

    // Two of a kind
    var pair = null;
    if (r[0] === r[1] || r[0] === r[2]) pair = r[0];
    else if (r[1] === r[2])             pair = r[1];

    if (pair) {
      var m2 = PAYS_2[pair] || 1;
      return { kind: 'win', amount: m2 * bet, text: 'Two ' + pair + ' — ' + m2 + '×' };
    }

    return { kind: 'lose' };
  }

  function finish(result, bet) {
    var outcome = evaluate(result, bet);

    if (outcome.kind === 'jackpot') {
      // Like a real slot: you only take the WHOLE jackpot at max bet.
      // At a smaller bet you win the matching share of it.
      var share = bet / BETS[BETS.length - 1];
      var won   = jackpot * share;

      credits += won;
      elReels.classList.add('jackpot');

      if (share === 1) {
        jackpot = JACKPOT_AFTER;
        message('🎉 MEGA JACKPOT!! You won ' + money(won, 2) + ' credits!', 'jack');
      } else {
        jackpot -= won;
        message('🎉 JACKPOT! ' + Math.round(share * 100) + '% share (max bet wins it all) · +'
                + money(won, 2), 'jack');
      }

    } else if (outcome.kind === 'win') {
      credits += outcome.amount;
      elReels.classList.add('win');
      message(outcome.text + ' · +' + money(outcome.amount, 0) + ' credits', 'win');

    } else {
      message('No win this time — spin again', '');
    }

    spinning = false;
    save();
    render();

    if (credits < BETS[0]) {
      message('Out of credits! Press "Reset demo credits" below.', '');
    }
  }


  /* ---------- BUTTONS ---------- */

  btnSpin.addEventListener('click', spin);

  btnUp.addEventListener('click', function () {
    if (betIndex < BETS.length - 1) { betIndex++; render(); }
  });

  btnDown.addEventListener('click', function () {
    if (betIndex > 0) { betIndex--; render(); }
  });

  btnReset.addEventListener('click', function () {
    credits = START_CREDITS;
    save();
    render();
    message('Demo credits restored — press SPIN', '');
  });

  // Is the slot machine currently on screen?
  function gameIsVisible() {
    var box = elReels.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight;
  }

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (!gameIsVisible()) return;   // don't hijack keys elsewhere on the page

    // SPACE BAR = spin
    if (e.code === 'Space') {
      e.preventDefault();
      spin();
    }

    // J = force a jackpot.
    // This is only here so you can preview the win animation while
    // designing. Delete this whole block for a finished site.
    if (e.code === 'KeyJ' && !spinning) {
      reels.forEach(function (r) { r.textContent = '7️⃣'; });
      finish(['7️⃣','7️⃣','7️⃣'], BETS[betIndex]);
    }
  });


  /* ---------- START ---------- */
  render();

})();
