# NBA Sports Modeling MVP

Phase 1 is a single Next.js app that shows NBA-style teams, games, players, and an explainable matchup model. It uses mock data by default, with a provider interface that can be swapped later.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Next.js route handlers for the API
- Vitest for focused model and API tests

## What Phase 1 Includes

- Responsive dashboard and navigation
- Games, Teams, Players, and Model pages
- Strict shared TypeScript interfaces in `types/nba.ts`
- Mock-first normalized data provider
- Explainable prediction engine with fixed weights
- Thin API routes that validate input and orchestrate model calls

## Local Setup

1. Open a terminal in `C:\Users\olive\OneDrive\Documents\NBA Prediction\nba-modeling-mvp`
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Run Checks

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test
```

Production build:

```bash
npm run build
```

## Project Structure

- `app/`: pages and API route handlers
- `components/`: reusable UI
- `lib/data/`: provider abstraction and mock/live adapters
- `lib/model/`: prediction constants, calculations, and explanations
- `lib/validation/`: request validation
- `types/`: shared domain interfaces
- `tests/`: model and API tests

## Data Provider Notes

Phase 1 uses the mock provider by default. The provider selection lives in `lib/data/provider-factory.ts`.

- Default: `MockDataProvider`
- Future option: `NbaLiveProvider`

To add a live public source later:

1. Implement `lib/data/adapters/nba-live-provider.ts`
2. Keep its outputs normalized to the shared interfaces in `types/nba.ts`
3. Set `NBA_DATA_PROVIDER=live`

## Odds Provider Notes

The odds layer is separate from the data provider and lives in `lib/odds/`.

- Default: `MockOddsProvider`
- Live option: `LiveOddsProvider`
- Live source: [The Odds API](https://the-odds-api.com/sports/nba-odds.html)

To enable live odds:

1. Set `NBA_ODDS_PROVIDER=live`
2. Set `THE_ODDS_API_KEY=your_key_here`
3. Optional: set `THE_ODDS_API_BOOKMAKERS=draftkings,fanduel`

If the live odds request fails, returns partial coverage, or does not match the current internal game slate, the app falls back to mock odds and keeps the page stable.

## Model Notes

Weights are defined once in `lib/model/constants.ts`.

- recent form: 30%
- offensive average: 25%
- defensive average: 25%
- pace: 10%
- trend delta: 10%
- home court: +3 edge points after scaling

Confidence bands are based on the final edge:

- Low: `|edge| < 3`
- Medium: `3 <= |edge| <= 7`
- High: `|edge| > 7`

Confidence score is capped at 75%.

## Limitations

- Mock data only in Phase 1
- No historical backtesting
- No persistence or database
- No authentication
- Model is heuristic and illustrative, not a guarantee
