---
project: 10xCards v2
context_type: brownfield
created: 2026-05-19
updated: 2026-05-19
checkpoint:
  current_phase: 5
  phases_completed: [1, 2, 3, 4]
  gray_areas_resolved:
    - topic: context type
      decision: Brownfield - existing 10xCards app is the base for MVP v2.
    - topic: repetition algorithm
      decision: Use a ready-made SM-2 implementation for MVP v2, wrapped behind an app service boundary.
    - topic: content source
      decision: Build the initial flashcard base from Polish 10xDevs3 markdown and plain text lesson files.
    - topic: quality gate
      decision: Include flashcard quality review as an MVP candidate, not as a custom learning algorithm.
  frs_drafted: 12
  quality_check_status: pending
---

## Current System Overview

10xCards is an existing web app for managing topics, documents, and flashcards. It supports user registration and login, AI-assisted flashcard generation via OpenRouter, manual flashcard management, and an approval flow for AI-generated flashcards.

Current stack described by the project: Astro, TypeScript, React, Tailwind CSS, shadcn/ui, Supabase Auth/Postgres, and OpenRouter. The current README marks the learning and spaced repetition system as planned but not implemented.

Existing domain objects and flows that must be preserved: user auth, topics, documents, flashcards, AI-generated vs manual flashcard source, pending/approved/rejected approval states, and the existing document-to-flashcards generation flow.

## Problem Statement & Motivation

The app can already help create and manage flashcards, but it does not yet close the learning loop. For 10xCards v2, the motivating gap is turning course lesson markdown into high-quality flashcards that can be reviewed over time, not just generated and stored.

The first concrete content source is the Polish 10xDevs3 course material downloaded into markdown or plain text. The product should help a learner convert those lessons into a usable flashcard base, keep source traceability, review generated cards before use, and schedule repetitions with a ready-made algorithm.

Current workaround: manually reading lesson markdowns and manually creating or approving flashcards without a reliable repeat-review loop.

## User & Persona

Primary persona: a Polish-speaking 10xDevs3 learner/developer who is building their own course project and wants to learn the course material while developing 10xCards v2.

Moment of use: after importing or opening course lesson markdown, the learner wants the app to propose flashcards, let them reject or improve weak cards, and later run review sessions based on due cards.

## Access Control Changes

No major access control change planned for MVP v2. Preserve the current authenticated-user model: each user signs in and works with their own topics, documents, flashcards, and sessions.

Open point: decide whether imported course markdown should be treated as private per user, shared seed data, or local-only development data.

## Success Criteria

### Primary

- A learner can generate an initial flashcard set from selected Polish course markdown lessons and approve only cards that meet the quality bar.
- A learner can start a review session and receive cards scheduled by a ready-made SM-2-style repetition algorithm.

### Secondary

- Generated flashcards retain enough source context to trace a card back to its lesson.
- Prompt quality improves compared with the current generic generation flow.
- The app can show basic learning progress: due cards, reviewed cards, and next review dates.

### Guardrails

- Existing login, topics, documents, flashcards, and approval flows must not regress.
- MVP must not include a custom advanced spaced repetition algorithm.
- MVP must keep the AI output reviewable by the learner before cards become active learning material.

## User Stories

### US-01: Generate flashcards from lesson markdown

- **Given** a signed-in learner with a course lesson available as markdown
- **When** they request flashcard generation for that lesson
- **Then** they receive proposed flashcards connected to the lesson/document source

#### Acceptance Criteria

- Proposed flashcards are created as pending, not automatically trusted.
- Each proposed flashcard can be approved, edited, or rejected.
- The learner can tell which lesson/document produced the card.

### US-02: Review generated cards through a quality gate

- **Given** pending AI-generated flashcards
- **When** the learner reviews them
- **Then** weak cards can be rejected or improved before they enter learning sessions

#### Acceptance Criteria

- The app distinguishes pending, approved, and rejected cards.
- Approved cards become eligible for learning sessions.
- Rejected cards do not appear in learning sessions.

### US-03: Run a spaced repetition session

- **Given** approved flashcards with repetition state
- **When** the learner starts a session
- **Then** the app shows due cards and updates their next review dates based on learner grades

#### Acceptance Criteria

- The session uses a ready-made SM-2-style scheduling rule.
- The learner can grade recall quality after answering.
- The flashcard stores updated repetition state after review.

### US-04: Preserve existing content workflows

- **Given** existing topics, documents, and flashcards
- **When** MVP v2 features are added
- **Then** existing CRUD and approval behavior remains available

#### Acceptance Criteria

- Existing flashcards are not deleted or migrated destructively.
- Existing AI generation endpoints and UI flows keep working unless explicitly replaced by the MVP change.

## Scope of Change

- [new] Import or register Polish lesson markdown or plain text as source material for flashcard generation. Priority: must-have
- [new] Generate flashcard candidates from lesson markdown with prompts tuned for course learning. Priority: must-have
- [new] Track lesson/document source for generated flashcards. Priority: must-have
- [new] Apply a quality gate before generated flashcards enter learning sessions. Priority: must-have
- [new] Implement review sessions over approved flashcards. Priority: must-have
- [new] Store and update spaced repetition state for each reviewed flashcard. Priority: must-have
- [new] Use a ready-made SM-2 implementation through a local service boundary. Priority: must-have
- [new] Show due cards and next review dates. Priority: must-have
- [modified] Improve existing AI prompts for flashcard generation quality. Priority: must-have
- [modified] Treat approved flashcards as learning-ready, not only content-management-ready. Priority: must-have
- [preserved] Existing auth, topic, document, flashcard, and approval flows must keep working. Priority: must-have
- [preserved] Existing Supabase-backed user data ownership must remain intact. Priority: must-have

## Constraints & Compatibility

- Preserve current authenticated-user data boundaries.
- Preserve existing topic, document, and flashcard data.
- Avoid destructive schema changes unless backed by migrations and a rollback path.
- Keep the repetition algorithm replaceable behind an app-owned service interface.
- Keep course markdown handling compatible with an Obsidian-style local markdown repository.

## Business Logic Changes

Draft rule: The app turns trusted lesson source material into reviewable flashcards, gates their quality before activation, and schedules approved cards for repetition based on the learner's recall outcome.

This changes 10xCards from a flashcard creation and management app into a learning-loop app. The key new decision is whether a card is ready for learning and when it should be reviewed next.

The repetition algorithm should be ready-made SM-2 for MVP v2. The app should own the service boundary and persisted state shape, not leak a package API through the product.

## Non-Functional Requirements

- A learner receives visible feedback for AI generation or review-session actions that take longer than two seconds.
- A review answer update must be durable before the next card is shown as completed.
- Course-derived flashcards remain scoped to the authenticated user's workspace unless a later decision explicitly introduces shared seed data.
- The app remains usable in a local development environment with local Supabase.

## Non-Goals

- No custom advanced repetition algorithm in MVP v2; use a ready-made SM-2 implementation.
- No FSRS migration in MVP v2; keep it as a later evaluation candidate.
- No team workspaces or shared decks in MVP v2.
- No mobile app in MVP v2.
- No PDF, DOCX, HTML, EPUB, image, audio, or video import in MVP v2.
- No integrations with external learning platforms in MVP v2.
- No email, push, or calendar reminders for overdue reviews in MVP v2; overdue cards remain due and are shown first in the next session.
- No full course-content crawler inside the app in MVP v2 unless we explicitly decide it belongs in product scope.

## Open Questions

1. **Markdown/plain text ingestion shape** - Owner: user/Codex. Decide whether course files enter the app through manual document creation, a local import script, or an in-app importer.
2. **Source traceability depth** - Owner: user. Decide whether a flashcard links only to a lesson document or also to a specific heading/section.
3. **Quality Gate definition** - Owner: user/Codex. Define measurable criteria for a good flashcard: atomicity, answer length, source faithfulness, ambiguity, and usefulness for recall.
4. **Review grading UI** - Owner: user. Decide whether MVP uses 0-5 SM-2 grades directly or a simpler UI mapped to SM-2 grades.
5. **Course material privacy** - Owner: user. Decide whether imported lesson markdown is private per user, shared seed data, or only local developer data.
6. **MVP delivery budget** - Owner: user. Confirm target delivery window and whether this remains after-hours work.

## Forward: technical-roadmap

- Candidate package: `@open-spaced-repetition/sm-2`.
- Service boundary: `src/lib/services/spaced-repetition.service.ts`.
- Existing note: `docs/decisions/spaced-repetition.md`.
- Future candidate after MVP: `ts-fsrs`, if the product needs richer scheduling.
