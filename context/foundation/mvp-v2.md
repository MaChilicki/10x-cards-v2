# 10xCards v2 - MVP

Date: 2026-05-19
Status: draft
Context: brownfield change to the existing 10xCards app

## Course Baseline

The course example defines 10xCards MVP around:

- AI flashcard generation from pasted text
- manual flashcard creation
- flashcard browsing, editing, and deletion
- simple user accounts
- integration with a ready-made repetition algorithm

It explicitly excludes:

- a custom advanced repetition algorithm such as SuperMemo or Anki
- sharing decks between users

The course success signal is also useful for us:

- 75% of AI-generated flashcards are accepted by the user
- users create 75% of flashcards with AI

## MVP v2 Vision

10xCards v2 turns the existing flashcard management app into a learning-loop app for the Polish 10xDevs3 course material.

The learner should be able to take lesson markdown, generate useful flashcards, reject or fix weak cards, and review approved cards in spaced repetition sessions.

## Primary Persona

Polish-speaking 10xDevs3 learner/developer who wants to retain course material while building the course project.

## Core Problem

Course lessons contain a lot of implementation and product-shaping knowledge, but manually converting them into reliable flashcards is slow. Without a learning loop, generated cards stay as content records instead of becoming an active study system.

## MVP Business Rule

The app converts trusted lesson markdown into candidate flashcards, gates their quality before activation, and schedules approved cards for repetition based on the learner's recall outcome.

## First Valuable Flow

1. Learner signs in.
2. Learner imports or selects Polish course lesson markdown.
3. App creates or updates a document for that lesson.
4. Learner asks AI to generate flashcard candidates.
5. App applies a Quality Gate checklist and marks generated cards as pending.
6. Learner approves, edits, or rejects generated cards.
7. Approved cards become eligible for learning.
8. Learner starts a review session.
9. App shows due cards.
10. Learner reveals the answer and grades recall.
11. App updates repetition state using ready-made SM-2.
12. Learner sees basic session progress and next review dates.

This is the MVP. Anything that does not support this loop is secondary.

## In Scope

### Course Markdown Source

- Import or register selected Polish lesson markdown or plain text files as documents.
- Preserve lesson title and source path.
- Generate cards only from Polish lesson content.
- Keep the imported content scoped to the signed-in user for MVP.

### AI Flashcard Generation

- Improve the current generation prompt for course-learning flashcards.
- Generate atomic question-answer cards.
- Avoid cards based on trivia, navigation text, duplicated fragments, or vague summaries.
- Keep generated cards pending until reviewed.

### Quality Gate

Quality Gate is a product feature, not only a prompt instruction.

For MVP, a card passes the gate only if:

- it tests one concept or decision at a time,
- the answer is faithful to the source lesson,
- the question is answerable without hidden context,
- the answer is short enough for recall practice,
- it is useful for learning course/project decisions,
- it is not a near-duplicate of another pending or approved card from the same lesson.

MVP implementation may combine automatic checks with manual approval. Manual approval remains the final decision.

### Approval Flow

- Pending generated cards can be approved, edited, or rejected.
- Rejected cards do not enter learning sessions.
- Edited and approved cards preserve source traceability.

### Learn Loop

- Add review sessions for approved cards.
- Show due cards first.
- Let the learner reveal an answer and grade recall.
- Use simple recall buttons mapped to SM-2 grades:
  - Again -> low grade
  - Hard -> passing but weak
  - Good -> normal recall
  - Easy -> strong recall
- Persist review history, interval, easiness factor, repetition count, last review date, and next review date.

### SM-2 Integration

- Use a ready-made SM-2 implementation, preferred package: `@open-spaced-repetition/sm-2`.
- Wrap the package in `src/lib/services/spaced-repetition.service.ts`.
- Keep library-specific types out of UI, API handlers, and database DTOs.

### Basic Progress

- Show count of due cards.
- Show count of reviewed cards in the current session.
- Show next review date on reviewed cards or session summary.
- If the learner does not return for a week, overdue cards remain due and are shown first in the next review session.

## Out of Scope

- No custom advanced repetition algorithm.
- No FSRS in MVP v2.
- No shared decks or team workspaces.
- No public marketplace of course flashcards.
- No mobile app.
- No import of PDF, DOCX, HTML, EPUB, images, audio, or video in MVP v2.
- No full authenticated course-platform crawler inside the app.
- No integrations with external learning platforms.
- No video/audio processing for flashcard generation.
- No email, push, or calendar reminders for overdue reviews in MVP v2.
- No multilingual version; MVP is Polish-only.
- No broad Obsidian sync. Source markdown compatibility is enough.

## Success Criteria

### Primary

- A learner can generate flashcards from at least one Polish 10xDevs3 markdown lesson.
- A learner can approve, edit, or reject generated cards before learning.
- A learner can complete a review session using approved cards.
- Review outcomes update next review dates through SM-2.

### Product Quality

- At least 75% of generated flashcards from a representative lesson are accepted after edit/reject review.
- At least 75% of the learner's new cards in the MVP flow come from AI generation rather than manual creation.
- Every learning card can be traced back to its source lesson/document.

### Guardrails

- Existing auth, topics, documents, flashcards, and approval behavior keep working.
- Existing user data is not destructively migrated.
- Generated cards never become active learning cards without learner approval.

## Functional Requirements

- FR-001: Signed-in learner can import or register a Polish markdown or plain text lesson as a document. Priority: must-have
- FR-002: Signed-in learner can generate flashcard candidates from a lesson document. Priority: must-have
- FR-003: System can store source lesson metadata for generated flashcards. Priority: must-have
- FR-004: System can mark generated flashcards as pending by default. Priority: must-have
- FR-005: Learner can approve, edit, or reject pending flashcards. Priority: must-have
- FR-006: System can prevent rejected cards from appearing in learning sessions. Priority: must-have
- FR-007: System can select due approved cards for a review session. Priority: must-have
- FR-008: Learner can reveal card answers during a session. Priority: must-have
- FR-009: Learner can grade recall with simple buttons mapped to SM-2 grades. Priority: must-have
- FR-010: System can update SM-2 repetition state after each graded answer. Priority: must-have
- FR-011: Learner can see current session progress. Priority: must-have
- FR-012: Learner can see next review dates for reviewed cards. Priority: must-have
- FR-013: Existing document-to-flashcard generation keeps working for non-course documents. Priority: must-have
- FR-014: Learner can still manually create and edit flashcards. Priority: must-have

## Minimal Data Decisions

Use existing concepts where possible:

- `topics` for grouping course/module content
- `documents` for lesson markdown content
- `flashcards` for generated/manual cards
- `spaced_repetition_data` for SM-2 state
- `study_sessions` and `study_session_results` for review sessions

Likely additions or confirmations:

- source lesson metadata on document or flashcard level
- Quality Gate result/status if not already represented by existing approval fields
- review grade mapping stored in review history

## Implementation Slices

### Slice 1 - Source and Prompt

- Decide exact import path for local markdown.
- Improve generation prompt for course lessons.
- Preserve lesson metadata.

### Slice 2 - Quality Gate

- Define card quality checklist in code/prompt.
- Keep cards pending.
- Improve approval/edit/reject workflow if needed.

### Slice 3 - SM-2 Service

- Add `@open-spaced-repetition/sm-2`.
- Implement `spaced-repetition.service.ts`.
- Add unit tests for grade mapping and next-review state.

### Slice 4 - Review Session

- Fetch due approved cards.
- Build session UI.
- Persist answer grades and updated SRS state.

### Slice 5 - Progress and Polish

- Show due counts, reviewed count, and next review dates.
- Add basic empty states.
- Run regression tests for existing auth/content flows.

## Open Decisions Before PRD

1. Exact markdown/plain text import shape: local script, admin/dev import, or in-app file picker.
2. Source traceability depth: lesson-level only or heading-level anchors.
3. Final Quality Gate scoring: binary pass/fail or checklist with reasons.
4. Final recall UI labels and exact mapping to SM-2 grades.
5. Whether course markdown should be seed data or private user data in production.
