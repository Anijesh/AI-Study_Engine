# AI Study Engine

A structured AI-powered academic productivity system built using Flask (API), React, and SQLite.

## Problem Framing

Students often struggle with planning, consistency, and targeted revision. 
This project explores how AI can assist academic workflows while preserving system correctness, safety, and predictable behavior.

The focus was not building a feature-heavy product, but rather designing a tightly scoped, highly reliable system that remains understandable, correct, and easily extensible as it evolves. By prioritizing structural clarity, the system minimizes technical debt while explicitly defining the boundaries between business logic and the AI integration layer.

## Overview

The system provides a comprehensive suite of features for students:
- **Organized Academic Tracking:** Manage subjects, topics, and granular subtopics.
- **Smart Study Plans:** Generate structured, topic-specific AI study plans tailored to exam dates.
- **Interactive Evaluation:** Create, attempt, and review AI-generated multiple-choice quizzes to test retention.
- **Actionable Performance Analytics:** Track completion rates, monitor quiz accuracy over time, and identify the weakest topics that need revision.
- **Contextual Doubt Solving:** Resolve academic doubts instantly using an AI assistant scoped strictly to the current topic.

The primary goal of this project was not feature breadth, but structural clarity, correctness, AI safety, and change resilience under a rigid 48-hour development constraint.

## 🏗 Architecture Overview

### Tech Stack

- **Backend:** Flask. Chosen for its lightweight nature allowing for a clean, custom layered architecture without the overhead of bulkier frameworks.
- **Frontend:** React + Vite. Enables a highly responsive, component-driven SPA interface with rapid build times.
- **Database:** SQLite. Employed for operational simplicity during the prototype phase, but structured with a strictly relational, completely normalized schema ready for PostgreSQL migration.
- **Authentication:** Stateless JWT implemented via `flask-jwt-extended` for secure, horizontally scalable session management.
- **AI Integration:** Google Gemini (via OpenAI SDK compatibility layer), utilizing strict prompt engineering and Pydantic schema validation to force structured JSON outputs.
- **Testing:** Pytest. Configured to run against an isolated in-memory SQLite database to ensure fast, deterministic integration tests.

### Folder Structure (Backend)
```text
app/
 ├── routes/      # Thin controllers parsing HTTP requests and formatting responses
 ├── services/    # Heavy lifting: Business logic, complex queries, and ownership enforcement
 ├── models/      # SQLAlchemy ORM definitions, constraints, and relationships
 ├── ai/          # The isolating boundary for untrusted LLM interactions
 │    ├── study_agent.py  # The primary AI orchestrator class
 │    ├── prompts.py      # Version-controlled system prompts
 │    └── schemas.py      # Pydantic models the AI must strictly adhere to
 ├── extensions.py # Shared instances (db, jwt, bcrypt, cors)
 └── config.py     # Environment-based configuration management
```

**Design Principle: Clear Boundaries**

To prevent the "Big Ball of Mud" anti-pattern, the backend enforces strict layered boundaries:
- **Routes** map endpoints to functions and handle HTTP status codes exclusively. They contain zero database logic.
- **Services** acts as the definitive source of truth for business logic. They exclusively handle database transactions, perform cross-entity validation, and universally enforce user ownership rules.
- **Models** map directly to the normalized relational schema and leverage database-level constraints (like unique constraints and check constraints) to prevent invalid data states at the lowest possible level.
- **AI Layer** acts as a quarantined zone. It handles the orchestration of prompt generation and structured validation, ensuring the LLM's non-deterministic outputs never directly interface with the core business logic unvalidated.

This separation ensures:
- New features can be safely added without modifying core domain logic or inadvertently breaking existing flows.
- The inherent unpredictability of AI integration does not leak into rigid business rules.
- Testability is significantly improved, as services can be tested independently of HTTP requests, and the AI layer can be mocked entirely.
- Failures remain localized, highly diagnosable, and easier to patch.

## 🔐 Authentication & Universal Ownership Enforcement

Security and data isolation are treated as first-class invariants:
- **JWT-based authentication** ensures that every incoming API request is cryptographically signed and verified.
- **Universal Ownership Validation:** The system guarantees that no entity (Subject, Topic, Session, or Quiz) can be accessed, modified, or deleted cross-user.
- **Service-Level Enforcement:** Crucially, ownership checks explicitly occur in the `Service` layer, not in the `Routes`. This ensures that even if a developer adds a new route or background job in the future, the core capability to circumvent user isolation remains blocked by the service.

This approach proactively prevents Insecure Direct Object Reference (IDOR) vulnerabilities by design, enforcing interface safety across the entire API surface.

## 📊 Domain Modeling & Data Invariants

### Core Entities
- **User:** Manages authentication and links to all downstream resources.
- **Subject:** The highest-level academic categorization.
- **Topic:** Granular areas of study belonging to a specific Subject.
- **StudySession:** Scheduled events mapping to a Topic.
- **QuizAttempt:** Records of user performance against AI-generated evaluations.

### Data Integrity Enforcement Rules
The database schema acts as the ultimate gatekeeper for data correctness, utilizing:
- **Enum constraints:** Enforces rigid states (e.g., Difficulty must be Easy/Medium/Hard; Session Status must be Pending/Completed/Missed).
- **CheckConstraints:** Enforces mathematical realities at the database level (e.g., A quiz score cannot be negative; A study session duration must be > 0).
- **Relational Integrity:** Extensive use of cascading deletes and foreign key constraints to prevent orphaned records.
- **Unique constraints:** Prevents duplicate Topics within a specific Subject.
- **Controlled state transitions:** The service layer prevents logically impossible actions, like marking a StudySession scheduled for next week as "Completed" today.

The system prevents invalid states at both:
- Database level
- Service layer level

## 🤖 AI Integration Strategy

AI is treated as untrusted structured input, not as business logic. AI output is treated as untrusted input and validated before being accepted by the system.

### Key Guardrails
- **No Free-text Parsing:** The system exclusively relies on `response_format={"type": "json_object"}`.
- **Strict Pydantic Validation:** Every AI response is aggressively parsed through Pydantic schemas (`PlanResponse`, `QuizResponse`, `DoubtResponse`). If the LLM misses a required field or returns an array instead of a string, the system explicitly rejects and handles the error gracefully.
- **No Direct Database Access:** The `StudyAgent` class cannot import `db.session`. It returns validated Python dictionaries to the Service layer, which retains sole authority on whether that data is persisted.
- **Graceful Degradation:** If the AI generates a study plan containing a Topic the user does not have, the mapping is skipped safely rather than crashing the request.
- **Separation of Concerns:** The act of *generating* a quiz by the AI is completely separated from the logic of a user *submitting* and scoring a quiz attempt.

### AI Capabilities
- **Study Plan Generation:** Synthesizes exam dates, user topics, and difficulty levels into a sequential, multi-day study schedule.
- **Quiz Generation:** Analyzes specific topic names to generate targeted, 4-option multiple-choice questions with deterministic answer keys.
- **Doubt Solver:** Context-aware tutoring that guarantees the response provides explanations, key summarizing points, and external resource suggestions.

## 🧠 AI Guidance & Constraints

The AI layer enforces predictable behavior by minimizing implicit assumptions:
- Prompts explicitly forbid markdown wrappers when returning JSON.
- Guidelines force the AI to return data in the exact shapes defined by the Pydantic schemas.

All instructions and orchestration logic are centrally located in:
- `app/ai/prompts.py` (The instructions)
- `app/ai/schemas.py` (The structural contracts)
- `ai_guidelines.md` (Design philosophy)

## 📈 Analytics

The frontend dashboard provides actionable insights computed entirely via efficient backend relational joins and aggregation queries, ensuring stringent user data isolation.

Calculated metrics include:
- **Global Completion Rate:** Tracking the percentage of `Pending` vs `Completed` sessions.
- **Total Study Load:** Measuring aggregate planned studying hours.
- **Average Quiz Accuracy:** Aggregating scores across all attempts.
- **Weakest Topic Detection:** Using historical quiz performance to programmatically identify areas heavily requiring revision.

## 🧪 Verification & Invariant Testing

Automated tests are implemented using Pytest. Rather than aiming for superficial line coverage, the test suite is expressly designed to focus on **rule enforcement** and protecting system invariants.

Key validation areas include:
- **Subject Date Validation:** Ensuring start dates cannot chronologically occur after end dates.
- **Duplicate Prevention:** Asserting that the unique constraints on topics actively reject duplicates.
- **Strict Ownership Isolation:** Explicitly writing tests where User B attempts to delete User A's subject, ensuring the service layer returns the correct operational rejection.
- **State Transition Constraints:** Preventing the completion of future-dated sessions.

To guarantee test isolation and prevent state bleed between assertions, all tests are executed against an entirely in-memory SQLite database, rebuilt fresh for every test run.

## ⚖ Design Tradeoffs & Constraints

Under the rigid 48-hour development constraint, I was forced to make intentional architectural tradeoffs:

- **Omission of Vector/RAG Retrieval:** I intentionally avoided adding RAG (Retrieval-Augmented Generation) or vector embedding layers. While highly feasible for features like searching past doubts, they introduce significant additional complexity, new failure modes, and tight coupling. Instead, I aggressively prioritized structural clarity, explicit correctness guarantees, and robust AI guardrails.
- **Database Choice:** SQLite was selected for raw development speed over PostgreSQL. However, because the schema is highly normalized and relies on standard SQLAlchemy abstractions, the migration path to Postgres is trivial.

The current architecture cleanly supports adding highly complex retrieval layers or message queues without requiring a rewrite of the core domain services.

## ⚠️ Risks & Limitations

- **Non-Deterministic Dependencies:** Despite strict schema validation, the *quality* and *accuracy* of the AI responses fundamentally depend on the underlying Gemini model's behavior, which may vary.
- **Lack of Rate Limiting:** The API currently lacks rate-limiting (e.g., via Redis), making it theoretically vulnerable to abuse of the costly LLM generation endpoints.
- **Synchronous AI Processing:** AI requests block the main thread. A production deployment would inevitably require offloading these requests to a background job queue (like Celery or RQ) to prevent request timeouts.

## 🔮 Extension Approach

Potential extensions:
- Vector-based RAG for contextual doubt solving
- Adaptive quiz difficulty adjustment
- Background job scheduling for study reminders
- Multi-device session synchronization
- AI interaction logging for personalization

The layered architecture allows these features to be added without rewriting core logic.

## 🚀 Running the Project

### Backend
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend
```sh
npm install
npm run dev
```

**Environment variables required:**
```env
GEMINI_API_KEY=
```
