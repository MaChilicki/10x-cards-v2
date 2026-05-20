---
project: 10xCards v2
version: 1
status: draft
created: 2026-05-19
context_type: brownfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  delivery_weeks: 3
  hard_deadline: null
  after_hours_only: true
---

## Current System Overview

10xCards is an existing web app for managing topics, documents, and flashcards. It supports user registration and login, AI-assisted flashcard generation, manual flashcard management, and an approval flow for AI-generated flashcards.

Current stack described by the project: Astro, TypeScript, React, Tailwind CSS, shadcn/ui, Supabase Auth/Postgres, and OpenRouter. The current README marks the learning and spaced repetition system as planned but not implemented.

Existing domain objects and flows that must be preserved: user auth, topics, documents, flashcards, AI-generated vs manual flashcard source, pending/approved/rejected approval states, and the existing document-to-flashcards generation flow.

Current user base: this is a course project, not a production rollout. Today it is used by the project author, and it will also be reviewed by course instructors during project assessment. Expected scale is a few to a few dozen people, primarily course participants and reviewers.

## Problem Statement & Motivation

The app can already help create and manage flashcards, but it does not yet close the learning loop. For 10xCards v2, the motivating gap is turning course lesson markdown into high-quality flashcards that can be reviewed over time, not just generated and stored.

The first concrete content source is Polish course material downloaded into markdown or plain text. The product should help a learner convert those lessons into a usable flashcard base, keep source traceability, review generated cards before use, and schedule repetitions with a ready-made algorithm.

This change is needed now because the current app has clear learning gaps: it can generate flashcards, but it does not support repeated review, does not verify generated card quality, and does not help assess whether learning is improving. The goal of v2 is to make flashcards a practical tool for retaining the most important course knowledge.

Current workaround: manually reading lesson markdowns and manually creating or approving flashcards without a reliable repeat-review loop.

## User & Persona

Primary persona: a Polish-speaking learner/developer who is building their own project and wants to learn course material while developing 10xCards v2.

Moment of use: after importing or opening course lesson markdown, the learner wants the app to propose flashcards, let them reject or improve weak cards, and later run review sessions based on due cards.

## Success Criteria

### Primary

- A learner can manually paste or drag-and-drop one Polish markdown/plain text lesson file as a document.
- A learner can generate flashcards from that lesson.
- A learner can approve, edit, or reject generated cards before learning.
- A learner can complete a review session using approved cards.
- Review outcomes update next review dates through SM-2.
- A learner can see a lightweight AI review report that flags weak generated cards and obvious lesson coverage gaps.

### Secondary

- At least 75% of generated flashcards from a representative lesson are accepted after edit/reject review.
- At least 75% of the learner's new cards in the MVP flow come from AI generation rather than manual creation.
- Every learning card can be traced back to its source lesson or document.
- Prompt quality improves compared with the current generic generation flow.
- Quality and coverage feedback helps the learner decide what to edit, reject, or regenerate.
- Course reviewers can understand and exercise the complete MVP learning loop during project assessment.

### Guardrails

- Existing login, topics, documents, flashcards, and approval flows must not regress.
- Existing user data is not destructively changed.
- Generated cards never become active learning cards without learner approval.
- MVP must not include a custom advanced spaced repetition algorithm.
- Quality and coverage feedback must not automatically activate cards without learner approval.

## User Stories

### US-01: Generate flashcards from lesson markdown

Before: A lesson could be added as a regular document, but there was no flow focused on turning course material into a learning set.

- **Given** a signed-in learner with a course lesson available as markdown
- **When** they request flashcard generation for that lesson
- **Then** they receive proposed flashcards connected to the lesson/document source

#### Acceptance Criteria

- Proposed flashcards are created as pending, not automatically trusted.
- Each proposed flashcard can be approved, edited, or rejected.
- The learner can tell which lesson/document produced the card.

### US-02: Review generated cards through a quality gate

Before: Generated flashcards could be manually approved or rejected, but there was no separate feedback about card quality or lesson coverage.

- **Given** pending AI-generated flashcards
- **When** the learner reviews them
- **Then** weak cards can be rejected or improved before they enter learning sessions

#### Acceptance Criteria

- The app distinguishes pending, approved, and rejected cards.
- Approved cards become eligible for learning sessions.
- Rejected cards do not appear in learning sessions.
- The learner sees a lightweight quality and coverage report before making the final approval decision.

### US-03: Run a spaced repetition session

Before: Approved flashcards were content records, but they did not form a scheduled review session.

- **Given** approved flashcards with repetition state
- **When** the learner starts a session
- **Then** the app shows due cards and updates their next review dates based on learner grades

#### Acceptance Criteria

- The session uses a ready-made SM-2-style scheduling rule.
- The learner can grade recall quality after answering.
- The flashcard stores updated repetition state after review.

### US-04: Preserve existing content workflows

Before: Existing topic, document, and flashcard management was the working base of the app and must remain available.

- **Given** existing topics, documents, and flashcards
- **When** MVP v2 features are added
- **Then** existing content and approval behavior remains available

#### Acceptance Criteria

- Existing flashcards are not deleted or changed destructively.
- Existing AI generation and manual flashcard flows keep working unless explicitly replaced by the MVP change.

## Scope of Change

- [new] Signed-in learner can manually paste content or drag-and-drop one Polish markdown/plain text lesson file as a document.
- [new] Signed-in learner can generate flashcard candidates from a lesson document.
- [new] System can store source lesson metadata for generated flashcards.
- [new] System can mark generated flashcards as pending by default.
- [new] System can produce a lightweight AI quality and coverage report for a generated card set.
- [new] Learner can approve, edit, or reject pending flashcards.
- [new] System can prevent rejected cards from appearing in learning sessions.
- [new] System can select due approved cards for a review session.
- [new] Learner can reveal card answers during a session.
- [new] Learner can grade recall with simple buttons mapped to SM-2 grades.
- [new] System can update SM-2 repetition state after each graded answer.
- [new] Learner can see current session progress.
- [new] Learner can see next review dates for reviewed cards.
- [modified] Existing AI prompts are tuned for course-learning flashcards.
- [modified] Approved flashcards are treated as learning-ready, not only content-management-ready.
- [preserved] Existing document-to-flashcard generation keeps working for non-course documents.
- [preserved] Existing manual flashcard creation and editing remain available.
- [preserved] Existing auth, topic, document, flashcard, and approval flows must keep working.
- [preserved] Existing user data ownership must remain intact.

## Constraints & Compatibility

- Preserve current authenticated-user data boundaries.
- Preserve existing topic, document, and flashcard data.
- Avoid destructive data changes unless backed by an explicit recovery path.
- Keep the repetition algorithm replaceable behind an app-owned boundary.
- Keep course markdown handling compatible with a local markdown repository.
- Existing auth routes, topic/document/flashcard flows, and approval workflows must continue to work for current data.
- Any changes for repetition state, review sessions, or source metadata must preserve current data and allow recovery if the change must be rolled back.
- Existing AI generation should keep working for non-course documents unless deliberately replaced by the new prompt path.
- The first MVP does not need a full directory importer; manual paste or single-file drag-and-drop is enough.
- The quality and coverage report is advisory. Manual approval remains the final activation decision.

## Business Logic Changes

The app turns trusted lesson source material into reviewable flashcards, gives the learner quality and coverage feedback before activation, and schedules approved cards for repetition based on the learner's recall outcome.

This changes 10xCards from a flashcard creation and management app into a learning-loop app. The key new decisions are whether a card is ready for learning, whether the generated set misses important lesson areas, and when each approved card should be reviewed next.

The repetition algorithm should be ready-made SM-2 for MVP v2. The app should own the product boundary and persisted learning state shape, not leak implementation-specific details through the product.

## Access Control Changes

No access control changes planned for MVP v2. Preserve the current authenticated-user model: each user signs in and works with their own topics, documents, flashcards, and sessions.

Imported course markdown is treated as private user-scoped content for MVP. Shared seed data, public decks, and team workspaces remain out of scope unless a later decision explicitly changes that.

## Non-Goals

- No custom advanced repetition algorithm in MVP v2; use a ready-made SM-2 implementation.
- No switch to FSRS in MVP v2; keep it as a later evaluation candidate.
- No shared decks or team workspaces in MVP v2.
- No public marketplace of course flashcards in MVP v2.
- No mobile app in MVP v2.
- No PDF, DOCX, HTML, EPUB, image, audio, or video import in MVP v2.
- No full local directory importer in MVP v2; manual paste or single-file drag-and-drop is enough.
- No full authenticated course-platform crawler inside the app in MVP v2.
- No integrations with external learning platforms in MVP v2.
- No video/audio processing for flashcard generation in MVP v2.
- No persistent advanced Quality Gate analytics, scoring dashboard, or historical coverage trends in MVP v2.
- No email, push, or calendar reminders for overdue reviews in MVP v2; overdue cards remain due and are shown first in the next session.
- No multilingual version; MVP is Polish-only.
- No broad Obsidian sync; source markdown compatibility is enough.

## Open Questions

1. **Markdown/plain text ingestion shape after MVP** - Owner: user/Codex. Decide whether later versions add a local directory import script or in-app batch importer.
2. **Source traceability depth** - Owner: user. Decide whether a flashcard links only to a lesson document or also to a specific heading/section.
3. **Quality and coverage report storage shape** - Owner: user/Codex. Decide whether MVP stores the report result, recomputes it on demand, or keeps it as transient review feedback.
4. **Exact SM-2 grade mapping** - Owner: user/Codex. Confirm numeric mapping for Again, Hard, Good, and Easy before implementation.
5. **Assessment/demo source data shape** - Owner: user. Decide whether course markdown for assessment is prepared as per-user imported data, repository seed/demo data, or local developer data.
