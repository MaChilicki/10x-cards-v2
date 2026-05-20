# 10xCards App

## Project Description
10xCards is a cutting-edge card management application designed to simplify the creation, management, and sharing of digital cards. Built with modern technologies, the project aims to deliver a fast, scalable, and user-friendly experience suitable for both personal and professional use.

## Tech Stack
- **Astro 5**: A modern static site generator for building fast websites.
- **TypeScript 5**: Enhances code quality and maintainability with static type-checking.
- **React 19**: Powers dynamic user interfaces with interactive components.
- **Tailwind CSS 4**: Provides utility-first styling for rapid UI development.
- **Shadcn/ui**: Offers a consistent set of pre-designed UI components.
- **Node**: Version specified in the `.nvmrc` file for compatibility.

## Environment Variables Summary
To run the project locally, you'll need to create a `.env` file in the root directory with the following variables. See respective sections for more details on obtaining these values.

-   `OPENROUTER_API_KEY`: Your API key for OpenRouter.
-   `OPENROUTER_BASE_URL`: (Optional) The base URL for the OpenRouter API (defaults to `https://openrouter.ai/api/v1`).
-   `OPENROUTER_DEFAULT_MODEL`: The default LLM for AI features (e.g., `openai/gpt-4.1`).
-   `SUPABASE_URL`: URL for your local or remote Supabase instance.
-   `SUPABASE_KEY`: Anon key for your local or remote Supabase instance.
-   `E2E_USERNAME_ID` (for E2E tests): Test user ID.
-   `E2E_USERNAME` (for E2E tests): Test user email.
-   `E2E_PASSWORD` (for E2E tests): Test user password.


## Getting Started Locally
To run 10xCards on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MaChilicki/10xCards.git
    cd 10xCards
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Ensure you are using the correct Node version:**
    Check the `.nvmrc` file for the required Node version.
4.  **Configure environment variables:**
    Create a `.env` file in the root of the project (refer to "Environment Variables Summary" above and specific sections for details on OpenRouter and Supabase).
    ```bash
    # .env example
    OPENROUTER_API_KEY=your_openrouter_api_key
    OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
    OPENROUTER_DEFAULT_MODEL=openai/gpt-4.1

    SUPABASE_URL=your_local_supabase_url
    SUPABASE_KEY=your_local_supabase_anon_key

    # Variables for E2E tests (optional for basic local development)
    E2E_USERNAME_ID=test_user_id_example
    E2E_USERNAME=test@example.com
    E2E_PASSWORD=securepassword123
    ```
5.  **Set up and start the local Supabase instance** (see "Supabase Database Setup" section below).
6.  **Start the development server:**
    ```bash
    npm run dev
    ```

## Available Scripts
-   `npm run dev`: Launches the development server.
-   `npm run build`: Builds the project for production.
-   `npm run preview`: Previews the production build locally.
-   `npm run astro`: Accesses the Astro CLI for various commands.
-   `npm run lint`: Runs the ESLint linter to check for code quality issues.
-   `npm run lint:fix`: Attempts to automatically fix linting issues.
-   `npm run format`: Formats code using Prettier.
-   `npm run test`: Executes all unit tests (equivalent to `vitest run`).
-   For more specific test commands (watch mode, coverage, UI mode, E2E tests), see the "Unit Testing (Vitest)" and "End-to-End Testing (Playwright)" sections below.

## Project Structure Overview
The project follows a standard Astro application structure extended with 10x workflow documentation. Key directories include:
-   `./src`: Contains all source code.
-   `./src/pages`: Astro pages, defining the routes of the application.
-   `./src/pages/api`: API endpoints.
-   `./src/components`: Reusable UI components (Astro and React).
-   `./src/components/ui`: UI components from Shadcn/ui.
-   `./src/layouts`: Astro layouts for page structure.
-   `./src/lib`: Shared services, helpers, and configuration.
-   `./src/db`: Supabase client setup and database type definitions.
-   `./src/middleware`: Astro middleware.
-   `./public`: Static assets directly served.
-   `./supabase/migrations`: Database migration files.
-   `./context/foundation`: Living product and architecture context for the 10x workflow, including `shape-notes.md`, `prd.md`, and project-level MVP notes.
-   `./context/foundation/archive`: Historical copies of superseded foundation documents, for example restarted `shape-notes` sessions.
-   `./context/changes`: Change-scoped work artifacts created by 10x workflow skills when a change needs its own plan or research.
-   `./context/archive`: Completed change folders moved from `context/changes`; read-only by convention.
-   `./docs`: Technical documentation, API contracts, Postman collections, deployment notes, and implementation decisions.
-   `./docs/decisions`: Durable technical decisions, such as the spaced repetition approach.
-   `./.agents`: Project-local 10x skills and agent instructions used to keep course workflow reproducible.

The `context/` structure is not a separate project. It is the 10x workflow layer for this application. Product-level documents live in `context/foundation/`; implementation-facing documentation remains in `docs/`.

## Application Features

-   **Flashcard Management**:
    -   Automatic AI-powered flashcard generation from text (using LLM via OpenRouter).
    -   Manual creation, editing, and deletion of flashcards.
    -   Approval process for AI-generated flashcards.
    -   Indication of flashcard source (AI or manual).
-   **Content Organization**:
    -   Hierarchical structure: Topics -> Documents -> Flashcards.
    -   CRUD operations for topics.
    -   CRUD operations for documents, including adding source content for flashcards.
-   **User Authentication**:
    -   User registration, login, and session management (via Supabase Auth).
-   **Learning and Review System** (Planned Feature):
    -   A spaced repetition system for effective learning is planned for future implementation. This feature is not yet available.

## Development Environment Setup

### Supabase Database Setup

For local development using the Supabase CLI:

1.  **Install Supabase CLI**: Follow the [official documentation](https://supabase.com/docs/guides/cli).
2.  **Log in to Supabase CLI**:
    ```bash
    supabase login
    ```
3.  **Link to a Supabase project (optional, if you have a remote project for reference)**:
    ```bash
    supabase link --project-ref YOUR_PROJECT_REF
    ```
    Find `YOUR_PROJECT_REF` in your Supabase project dashboard.
4.  **Start the local Supabase instance**:
    ```bash
    supabase start
    ```
    This will start local Supabase services, including a Postgres database. Access credentials (URL, anon key, service_role key) will be displayed in the console. Copy the URL and anon key to your `.env` file.
5.  **Apply migrations and seed data**:
    -   Migrations in the `supabase/migrations` directory are automatically applied when you first run `supabase start`.
    -   To reset the local database and re-apply all migrations and seed data from `supabase/seed.sql`:
        ```bash
        supabase db reset
        ```
    -   To apply only the latest migrations to an existing local database:
        ```bash
        supabase migration up # Preferred command as of Supabase CLI v1.160.0+
        # or `supabase db push` for older versions or specific use cases
        ```

### AI-Powered Flashcard Generation (OpenRouter)

The application uses OpenRouter for AI-assisted flashcard generation. This functionality is primarily located in `src/lib/services/ai-generate.service.ts`, which utilizes a system prompt defined in `src/lib/prompts/generate-flashcards.md`.

**Configuration:**

AI features are configured via environment variables in your `.env` file (see "Environment Variables Summary" section).

**Changing the LLM Model:**

-   The primary way to change the model is by updating the `OPENROUTER_DEFAULT_MODEL` environment variable.
-   The model can also be overridden dynamically within the `OpenRouterService` if specific calls require a different model, though changing the environment variable is the standard approach for setting the default.

### Unit Testing (Vitest)
The project uses Vitest for unit testing.
-   **Running tests**:
    ```bash
    npm run test # Runs all unit tests
    npm run test:watch # Runs tests in watch mode
    npm run test:coverage # Runs tests and generates a coverage report
    npm run test:ui # Runs tests in UI mode (if configured)
    ```
-   **Structure**: Unit tests are located in the `tests/unit/` directory. They cover services, API endpoints, and frontend components.

### End-to-End Testing (Playwright)
The project uses Playwright for E2E tests.
-   **Running tests**:
    ```bash
    npm run test:e2e # Runs all E2E tests
    npm run test:e2e:ui # Runs E2E tests in UI mode
    npm run test:e2e:debug # Runs E2E tests in debug mode
    npm run test:e2e:report # Displays the E2E test report
    ```
-   **Structure**: E2E tests are in the `tests/e2e/` directory and use the Page Object Model (POM) pattern. Scenarios cover key user flows like login and content management.
    Additionally, `npm run dev:e2e` starts the development server in a special mode (`astro dev --mode test`) suitable for running E2E tests against a consistent test environment.

## CI/CD Automation (GitHub Actions)

The CI/CD process is automated using GitHub Actions (defined in `.github/workflows/pull-request.yml`). The workflow, triggered on every Pull Request to `main`, performs the following:
-   **Code Linting**.
-   **Unit Testing** with code coverage reporting.
-   **End-to-End Testing** (Playwright).
-   **Posts a comment** on the PR summarizing test results and code coverage.

## Deployment
The application is built as a Node.js server using `npm run build`. To deploy:
1.  Build the application: `npm run build`. This will create a `dist/` directory.
2.  The `dist/server/entry.mjs` file is the entry point for the Node.js server.
3.  Deploy the contents of the `dist/` directory (or just the server and client subdirectories if preferred) to a Node.js compatible hosting environment (e.g., a VPS, PaaS like Heroku, or serverless functions if adapted).
4.  Ensure all necessary environment variables (see "Environment Variables Summary") are set in your deployment environment.
5.  Start the server using `node dist/server/entry.mjs`.

Astro also supports various adapters for other deployment targets (e.g., Vercel, Netlify, Deno). Refer to the [Astro documentation on SSR adapters](https://docs.astro.build/en/guides/server-side-rendering/#configure-an-adapter) if you wish to use a different deployment strategy.

## Project Status
The 10xCards application is currently under active development. Ongoing updates and new features are being implemented to improve functionality and user experience.

## License
This project is licensed under the MIT License.
