---
project: "10xCards"
assessed_at: "2026-05-20T20:18:41+02:00"
agent_readiness: ready-with-compensation
context_type: brownfield
stack_components:
  language: "TypeScript"
  framework: "Astro 6.3.6 with React 19"
  build_tool: "Astro/Vite with Tailwind CSS 4"
  test_runner: "Vitest 3.1.3 and Playwright 1.60.0"
  package_manager: "npm"
  ci_provider: "GitHub Actions"
  deployment_target: "Astro Node adapter, standalone mode"
gates_passed: 8
gates_failed: 1
---

## Stack Components

The project is a TypeScript web application. `package.json` defines Astro scripts (`astro dev`, `astro build`, `astro preview`) and TypeScript-oriented dependencies, while `tsconfig.json` extends `astro/tsconfigs/strict`, configures React JSX, and maps `@/*` to `src/*`. Type safety is present, but not fully strict: `noImplicitAny` is explicitly disabled and `allowJs` is enabled.

The main application framework is Astro 6.3.6 with `@astrojs/react` 5.0.5. `astro.config.mjs` enables React, sitemap generation, Tailwind through Vite, server output, and the Node adapter 10.1.1 in standalone mode. Astro sessions are now handled by the adapter without the old `experimental.session` flag. The source layout follows Astro's file-based conventions with `src/pages`, `src/layouts`, `src/middleware`, `src/components`, `src/lib`, `src/db`, and `src/types`.

The build layer is Astro's Vite-based pipeline. `astro.config.mjs` registers Tailwind CSS through `@tailwindcss/vite` and configures SSR behavior for `@supabase/ssr`. `package-lock.json` identifies npm as the package manager, and `.nvmrc` pins Node 22.14.0.

Testing is split between Vitest 3.1.3 for unit/component tests and Playwright 1.60.0 for end-to-end tests. `vitest.config.ts` uses jsdom, React plugin support, setup files, coverage output, and `@` aliasing. `playwright.config.ts` targets Chromium, starts `npm run dev:e2e`, captures retry artifacts, and writes JSON/HTML reports.

Operationally, the project uses GitHub Actions for pull request checks. `.github/workflows/pull-request.yml` runs linting, coverage-backed unit tests, Playwright E2E tests, and posts a PR status comment. The data/auth stack is Supabase: `package.json` includes `@supabase/ssr` and `@supabase/supabase-js` 2.106.1, `src/db/database.types.ts` contains generated database types, and `supabase/migrations` contains schema history. After the dependency refresh, `npm audit --audit-level=low` reports 0 vulnerabilities. The brownfield PRD confirms the product context and existing stack in `context/foundation/prd.md`.

## Quality Gate Assessment

| Component | Typed | Convention | Training Data | Documented | Verdict |
| --- | --- | --- | --- | --- | --- |
| Language: TypeScript | ~ | - | - | - | partial |
| Framework: Astro + React | - | yes | yes | yes | pass |
| Build tool: Astro/Vite | - | yes | yes | yes | pass |
| Test runners: Vitest + Playwright | - | - | yes | yes | pass |

Legend: `yes` = pass, `no` = fail, `~` = partial, `-` = not applicable.

### Gate Details

Type safety is partially satisfied. The project uses TypeScript and `tsconfig.json` extends `astro/tsconfigs/strict`, which is a strong base for agent work. The gap is also in `tsconfig.json`: `noImplicitAny` is set to `false` and `allowJs` is set to `true`, so an agent can accidentally add weakly typed boundaries unless project instructions compensate.

Astro and React are convention-friendly in this codebase. `astro.config.mjs` uses standard Astro integrations, `src/pages` provides file-based routing, `src/middleware/index.ts` carries middleware, and the project separates components, services, schemas, database access, and types under predictable `src/*` folders. Local component READMEs in `src/components/documents/README.md` and `src/components/topics/README.md` add extra project-specific convention signals.

Astro, React, Vite, Vitest, Playwright, Tailwind, Supabase, and Zod are mainstream choices in the TypeScript ecosystem. They are common enough in training data that agents have useful priors for idiomatic code generation within this language family.

Documentation quality is strong. Astro, React, Vite, Vitest, Playwright, Tailwind, Supabase, and Zod all have current official docs and examples. The codebase also has local instruction and reference material in `AGENTS.md`, `README.md`, `docs/`, and `context/foundation/prd.md`.

## Gaps & Compensation

The only material agent-readiness gap is partial TypeScript strictness. Because `noImplicitAny` is disabled and JavaScript files are allowed, the repository's compiler configuration does not fully enforce explicit shapes at every boundary. This matters for agent workflows because agents depend on types, schemas, and contracts to make correct edits without reading the whole execution path.

The compensation is instruction-level discipline: new code should be treated as stricter than the current `tsconfig.json` minimum. The project already has Zod schemas in `src/lib/schemas`, generated database types in `src/db/database.types.ts`, and strict ESLint configuration in `eslint.config.js`, so the compensation path is lightweight.

### Recommended Instruction File Additions

Add this to `AGENTS.md` or the active agent instruction file:

```markdown
## Type Safety Rules

- Treat this repository as strict TypeScript even though `tsconfig.json` currently has `noImplicitAny: false` and `allowJs: true`.
- Do not add new `.js` files. New application code should be `.ts`, `.tsx`, or `.astro` as appropriate.
- All exported functions, API handlers, service functions, and React component props must have explicit input/output types.
- Use `unknown` instead of `any` for untrusted values, then narrow with Zod schemas from `src/lib/schemas` or a local schema near the boundary.
- For Supabase data, prefer generated types from `src/db/database.types.ts` and existing project DTOs from `src/types.ts` / `src/types/*`.
- Before considering a type-related change complete, run `npm run lint` and the relevant `npm run test` or `npm run test:e2e` command.
```

Add this when modifying API routes or service code:

```markdown
## API and Service Boundaries

- Request parsing and response shaping must be explicit. Validate request bodies, params, and query strings with Zod before passing data into `src/lib/services/*`.
- Keep Astro API route files in `src/pages/api/*` thin: parse input, call a typed service, map service results to HTTP responses.
- Keep domain logic in `src/lib/services/*`; shared request/response schemas belong in `src/lib/schemas/*`.
- Do not bypass Supabase typed clients or generated database types when reading or writing application tables.
```

## Summary

Overall readiness: ready with light compensation. The stack is a strong fit for agent-assisted work because it is TypeScript-first, convention-oriented through Astro, mainstream in the TypeScript ecosystem, and backed by current official documentation. The main weakness is that compiler settings currently permit implicit `any` and JavaScript files, so agent instructions should enforce stricter type discipline than the compiler alone.

Recommended next step: run `/10x-health-check` to inspect implementation health, tests, dependencies, and operational risks using this assessment as context.
