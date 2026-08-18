# Blue Lagoon Casino

A demo casino landing site built with [Astro](https://astro.build) and TypeScript.

**Live:** https://yunuasharovenko-boop.github.io/blue-lagoon/

**This is a design study, not a real casino.** The slot machine uses play money
only. There are no payments, no accounts and no real gambling.

## Running it on your computer

You need [Node.js](https://nodejs.org) installed. Then, in this folder:

```bash
npm install     # once, to download the tools
npm run dev     # start the live preview
```

Open the address it prints (usually http://localhost:4321/blue-lagoon/).
Save any file and the browser updates by itself.

| Command | What it does |
|---|---|
| `npm run dev` | Live preview while you work |
| `npm run build` | Build the finished site into `dist/` |
| `npm run preview` | View the finished site as visitors will see it |
| `npm run check` | Check the TypeScript for mistakes |

## Where things live

```
src/
  pages/            One file per page — the address comes from the filename
    index.astro                 →  /
    games.astro                 →  /games
    promotions.astro            →  /promotions
    responsible-gaming.astro    →  /responsible-gaming
  layouts/
    Base.astro      Header, footer and 18+ age gate — shared by every page
  components/
    SlotMachine.astro           The playable slot, drop in with <SlotMachine />
  scripts/
    game.ts         The slot machine rules
    site.ts         Age gate + mobile menu
  lib/
    urls.ts         Builds internal links that work in the /blue-lagoon/ folder
  styles/
    global.css      All the design. Colours are at the very top.
public/
  images/           Files here are copied to the site as-is
```

Repeated blocks — game tiles, bonus cards, FAQ entries — are written once as
typed lists at the top of each page and then looped over. To add a game, add a
line to the list; the markup is never touched.

## The slot machine

Three reels, fruit symbols, and a jackpot that grows over time.
Roughly 42% of spins win something; three sevens takes the jackpot.
You only win the full jackpot at max bet — smaller bets win a share.

Press **space** to spin, **J** to preview the jackpot animation.

Settings are at the top of `src/scripts/game.ts`:

```ts
const STRIP: readonly SlotSymbol[] = ['🍒','🍒','🍋','🍋','🍊','🍉','🍇','🔔','7️⃣'];
const PAYS_3: Partial<Record<SlotSymbol, number>> =
  { '🔔': 50, '🍇': 30, '🍉': 20, '🍊': 10, '🍋': 8, '🍒': 5 };
const START_CREDITS = 1000;
```

A symbol listed more times in `STRIP` is more likely to land. `SlotSymbol` lists
the only allowed symbols, so a typo like `'🍌'` is caught before the page loads.

## Publishing

Pushing to `main` is all it takes. A GitHub Action
(`.github/workflows/deploy.yml`) installs everything, type-checks, builds and
publishes the result. If the type check fails the site is not replaced, so a
broken build can never take the live site down.

```bash
git add -A
git commit -m "what I changed"
git push
```
