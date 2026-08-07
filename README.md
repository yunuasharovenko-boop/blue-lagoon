# Blue Lagoon Casino — landing page

A demo casino landing page built with plain HTML5, CSS and JavaScript.
No frameworks, no build step — open `index.html` in a browser and it runs.

**This is a design study, not a real casino.** The slot machine uses play
money only. There are no payments, no accounts and no real gambling.

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page: hero, playable slot, bonuses, FAQ |
| `games.html` | Game lobby — slots, live dealer, table games, jackpots |
| `promotions.html` | Bonuses, weekly promos and the VIP club |
| `responsible-gaming.html` | Limits, self-exclusion and support organisations |

## Files

| File | What it does |
|---|---|
| `style.css` | All the design. Colours are at the very top. |
| `script.js` | The 18+ age gate and the mobile menu |
| `game.js` | The "Fruit Fiesta" slot machine |

## The slot machine

Three reels, fruit symbols, and a jackpot that grows over time.
Roughly 42% of spins win something; three sevens takes the jackpot.
You only win the full jackpot at max bet — smaller bets win a share.

Press **space** to spin, **J** to preview the jackpot animation.

Settings live at the top of `game.js`:

```js
var STRIP = ['🍒','🍒','🍋','🍋','🍊','🍉','🍇','🔔','7️⃣'];
var PAYS_3 = { '🔔': 50, '🍇': 30, '🍉': 20, '🍊': 10, '🍋': 8, '🍒': 5 };
var START_CREDITS = 1000;
```

A symbol listed more times in `STRIP` is more likely to land.
