# Spaced repetition decision note

Date: 2026-05-19

## Context

The 10xDevs3 course does not mandate a specific spaced repetition algorithm. It points the MVP toward a ready-made repetition algorithm and explicitly keeps a custom advanced algorithm outside MVP scope.

The existing app model already fits the SM-2/SuperMemo shape:

- `repetitions`
- `easiness_factor`
- `interval`
- `next_review_date`
- `last_review_date`
- `review_history`

## Working decision for MVP v2

Use a ready-made SM-2 implementation for MVP v2, wrapped in our own scheduling service boundary.

Recommended boundary:

- `src/lib/services/spaced-repetition.service.ts`
- app-level input: flashcard current SRS state + user grade
- app-level output: updated SRS state + next review date

Do not spread library-specific types through UI, API handlers, or database DTOs.

## Candidate libraries

- `@open-spaced-repetition/sm-2` - TypeScript, MIT, maintained by the open-spaced-repetition org.
- `supermemo` - JavaScript/TypeScript, MIT, mature SM-2 package.
- `@dtjv/sm-2` - TypeScript, MIT, small SM-2 package, older maintenance.

Future candidate:

- `ts-fsrs` - TypeScript FSRS implementation. More modern, but likely too heavy for the first MVP because it needs richer review-state handling.

## Rationale

SM-2 is enough for MVP, aligns with the current database shape, and satisfies the course constraint to avoid inventing a custom repetition algorithm.

Keep the implementation replaceable so FSRS can be evaluated later without changing the product surface.
