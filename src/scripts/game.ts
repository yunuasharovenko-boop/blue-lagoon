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

   NOTE: do not edit the .js file in the js/ folder — it is
   generated from this file. Edit this one, then run:  npm run build
   ========================================================== */

/* ---------- THE TYPES ----------
   This is the part plain JavaScript did not have. Each type below
   describes the SHAPE of something, so the compiler can tell you when
   you use it wrongly — before the page ever opens in a browser. */

/** The only symbols a reel is allowed to show. Writing '🍌' anywhere
 *  in this file is now an error, because it is not in this list. */
type SlotSymbol = '🍒' | '🍋' | '🍊' | '🍉' | '🍇' | '🔔' | '7️⃣';

/** What the three reels show after a spin — exactly three, never two or four. */
type SpinResult = readonly [SlotSymbol, SlotSymbol, SlotSymbol];

/** The three things that can happen when the reels stop.
 *  Because each option lists a different `kind`, TypeScript knows that
 *  `outcome.amount` only exists when `kind` is 'win'. */
type Outcome =
  | { kind: 'jackpot' }
  | { kind: 'win'; amount: number; text: string }
  | { kind: 'lose' };

/** The styling of the message under the reels. */
type MessageStyle = '' | 'win' | 'jack';

/** Every element on the page the game needs to touch. */
interface GameElements {
  reels: HTMLElement;
  reelBoxes: readonly HTMLElement[];
  jackpot: HTMLElement;
  credits: HTMLElement;
  bet: HTMLElement;
  message: HTMLElement;
  spin: HTMLButtonElement;
  betUp: HTMLButtonElement;
  betDown: HTMLButtonElement;
  reset: HTMLButtonElement;
}


(function fruitFiesta(): void {

  /* ---------- SETTINGS you can safely change ---------- */

  // The reel strip. A symbol that appears more times here is
  // more likely to land. Add or remove entries to change the odds.
  //
  // Right now three 7s come up about once in 730 spins. To see the
  // jackpot animation without spinning that long, either add more
  // '7️⃣' entries here — or just press the J key (see the bottom of this file).
  const STRIP: readonly SlotSymbol[] = ['🍒','🍒','🍋','🍋','🍊','🍉','🍇','🔔','7️⃣'];

  // Payout for THREE of the same symbol (multiplied by your bet).
  // Partial<> means "not every symbol needs an entry here".
  const PAYS_3: Partial<Record<SlotSymbol, number>> =
    { '🔔': 50, '🍇': 30, '🍉': 20, '🍊': 10, '🍋': 8, '🍒': 5 };

  // Payout for TWO of the same symbol. Anything not listed pays 1×.
  const PAYS_2: Partial<Record<SlotSymbol, number>> = { '7️⃣': 5, '🍒': 2 };

  const START_CREDITS = 1000;    // credits a new player gets
  const START_JACKPOT = 12480;   // jackpot the first time the page is opened
  const JACKPOT_AFTER = 5000;    // jackpot resets to this after someone wins it
  const JACKPOT_SHARE = 0.05;    // 5% of every bet goes into the jackpot pool
                                 // (raising this makes the game pay out more
                                 //  than it takes in — 0.05 is roughly break-even)
  const BETS: readonly number[] = [10, 20, 50, 100];  // available bet sizes


  /* ---------- FIND THE PAGE ELEMENTS ----------
     Collected in one place. If any single one is missing, this returns
     null and the game quietly does not start — which is what we want on
     games.html, promotions.html and so on. */

  function collectElements(): GameElements | null {
    const get = <T extends HTMLElement>(id: string): T | null =>
      document.getElementById(id) as T | null;

    const reels   = get('reels');
    const reel0   = get('reel0');
    const reel1   = get('reel1');
    const reel2   = get('reel2');
    const jackpot = get('jackpotValue');
    const credits = get('creditsValue');
    const bet     = get('betValue');
    const message = get('slotMessage');
    const spin    = get<HTMLButtonElement>('spinBtn');
    const betUp   = get<HTMLButtonElement>('betUp');
    const betDown = get<HTMLButtonElement>('betDown');
    const reset   = get<HTMLButtonElement>('resetBtn');

    if (!reels || !reel0 || !reel1 || !reel2 || !jackpot || !credits ||
        !bet || !message || !spin || !betUp || !betDown || !reset) {
      return null;
    }

    return {
      reels, reelBoxes: [reel0, reel1, reel2], jackpot,
      credits, bet, message, spin, betUp, betDown, reset,
    };
  }


  /* ---------- THE GAME ITSELF ----------
     Everything below receives `el` as a parameter rather than reading a
     variable that might be null. That is why nothing in here has to keep
     re-checking whether the buttons exist — the type says they do. */

  function startGame(el: GameElements): void {

    /* --- state --- */

    function load(key: string, fallback: number): number {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = parseFloat(raw);
      return Number.isNaN(value) ? fallback : value;
    }

    let credits: number   = load('blCredits', START_CREDITS);
    let jackpot: number   = load('blJackpot', START_JACKPOT);
    let betIndex: number  = 0;
    let spinning: boolean = false;

    function save(): void {
      localStorage.setItem('blCredits', String(credits));
      localStorage.setItem('blJackpot', String(jackpot));
    }

    /** The bet currently selected. */
    function currentBet(): number {
      return BETS[betIndex] ?? BETS[0] ?? 10;
    }

    /** Turn 1234.5 into "1,234.50" */
    function money(amount: number, decimals: number): string {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }


    /* --- draw the current state on screen --- */

    function render(): void {
      el.credits.textContent = money(Math.floor(credits), 0);
      el.bet.textContent     = money(currentBet(), 0);
      el.jackpot.textContent = money(jackpot, 2);

      el.betDown.disabled = spinning || betIndex === 0;
      el.betUp.disabled   = spinning || betIndex === BETS.length - 1;
      el.spin.disabled    = spinning;
      el.spin.textContent = spinning ? 'SPINNING…' : 'SPIN';
    }

    function message(text: string, style: MessageStyle = ''): void {
      el.message.textContent = text;
      el.message.className = 'slot-message' + (style ? ' ' + style : '');
    }


    /* --- the jackpot ticker ---
       Grows slowly on its own, as if other players were betting.
       It makes the number feel alive. */
    window.setInterval((): void => {
      jackpot += Math.random() * 3 + 0.4;
      el.jackpot.textContent = money(jackpot, 2);
    }, 900);


    /* --- one spin --- */

    function randomSymbol(): SlotSymbol {
      const pick = STRIP[Math.floor(Math.random() * STRIP.length)];
      return pick ?? '🍒';
    }

    function spin(): void {
      if (spinning) return;

      const bet = currentBet();

      if (credits < bet) {
        message('Not enough credits — lower your bet or reset the demo');
        return;
      }

      // Take the bet, feed the jackpot
      credits -= bet;
      jackpot += bet * JACKPOT_SHARE;
      spinning = true;
      el.reels.classList.remove('win', 'jackpot');
      message('Good luck…');
      render();

      // Decide the result now; the animation just reveals it
      const result: SpinResult = [randomSymbol(), randomSymbol(), randomSymbol()];

      // Spin each reel, stopping them one after another (left to right)
      el.reelBoxes.forEach((reel: HTMLElement, i: number): void => {
        reel.classList.add('spinning');

        const flicker = window.setInterval((): void => {
          reel.textContent = randomSymbol();
        }, 70);

        window.setTimeout((): void => {
          window.clearInterval(flicker);
          reel.textContent = result[i] ?? null;
          reel.classList.remove('spinning');
          reel.classList.add('land');
          window.setTimeout((): void => reel.classList.remove('land'), 320);

          // When the LAST reel stops, check the result
          if (i === el.reelBoxes.length - 1) finish(result, bet);
        }, 700 + i * 450);
      });
    }


    /* --- what did we win? --- */

    function evaluate(r: SpinResult, bet: number): Outcome {
      // Three of a kind
      if (r[0] === r[1] && r[1] === r[2]) {
        if (r[0] === '7️⃣') return { kind: 'jackpot' };
        const multiplier = PAYS_3[r[0]] ?? 1;
        return {
          kind: 'win',
          amount: multiplier * bet,
          text: 'Three ' + r[0] + ' — ' + multiplier + '×',
        };
      }

      // Two of a kind
      let pair: SlotSymbol | null = null;
      if (r[0] === r[1] || r[0] === r[2]) pair = r[0];
      else if (r[1] === r[2])             pair = r[1];

      if (pair !== null) {
        const multiplier = PAYS_2[pair] ?? 1;
        return {
          kind: 'win',
          amount: multiplier * bet,
          text: 'Two ' + pair + ' — ' + multiplier + '×',
        };
      }

      return { kind: 'lose' };
    }

    function finish(result: SpinResult, bet: number): void {
      const outcome: Outcome = evaluate(result, bet);

      if (outcome.kind === 'jackpot') {
        // Like a real slot: you only take the WHOLE jackpot at max bet.
        // At a smaller bet you win the matching share of it.
        const maxBet = BETS[BETS.length - 1] ?? bet;
        const share  = bet / maxBet;
        const won    = jackpot * share;

        credits += won;
        el.reels.classList.add('jackpot');

        if (share === 1) {
          jackpot = JACKPOT_AFTER;
          message('🎉 MEGA JACKPOT!! You won ' + money(won, 2) + ' credits!', 'jack');
        } else {
          jackpot -= won;
          message('🎉 JACKPOT! ' + Math.round(share * 100) + '% share (max bet wins it all) · +'
                  + money(won, 2), 'jack');
        }

      } else if (outcome.kind === 'win') {
        // Only reachable when kind is 'win', so .amount and .text are
        // guaranteed to exist here — that is the point of the Outcome type.
        credits += outcome.amount;
        el.reels.classList.add('win');
        message(outcome.text + ' · +' + money(outcome.amount, 0) + ' credits', 'win');

      } else {
        message('No win this time — spin again');
      }

      spinning = false;
      save();
      render();

      if (credits < (BETS[0] ?? 10)) {
        message('Out of credits! Press "Reset demo credits" below.');
      }
    }


    /* --- buttons --- */

    el.spin.addEventListener('click', spin);

    el.betUp.addEventListener('click', (): void => {
      if (betIndex < BETS.length - 1) { betIndex++; render(); }
    });

    el.betDown.addEventListener('click', (): void => {
      if (betIndex > 0) { betIndex--; render(); }
    });

    el.reset.addEventListener('click', (): void => {
      credits = START_CREDITS;
      save();
      render();
      message('Demo credits restored — press SPIN');
    });

    /** Is the slot machine currently on screen? */
    function gameIsVisible(): boolean {
      const box = el.reels.getBoundingClientRect();
      return box.bottom > 0 && box.top < window.innerHeight;
    }

    document.addEventListener('keydown', (event: KeyboardEvent): void => {
      const active = document.activeElement;
      const tag = active ? active.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!gameIsVisible()) return;   // don't hijack keys elsewhere on the page

      // SPACE BAR = spin
      if (event.code === 'Space') {
        event.preventDefault();
        spin();
      }

      // J = force a jackpot.
      // This is only here so you can preview the win animation while
      // designing. Delete this whole block for a finished site.
      if (event.code === 'KeyJ' && !spinning) {
        el.reelBoxes.forEach((reel: HTMLElement): void => { reel.textContent = '7️⃣'; });
        finish(['7️⃣','7️⃣','7️⃣'], currentBet());
      }
    });


    /* --- start --- */
    render();
  }


  /* ---------- GO ---------- */

  const elements = collectElements();
  if (elements) startGame(elements);

})();
