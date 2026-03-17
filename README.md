# ft_transcendence

A full-stack single-page web application centered around a real-time 1v1 Pong game, built as part of the [42 curriculum](https://42.fr/).

Users can sign up, play Pong against each other or an AI opponent, chat with friends, climb the leaderboard, and manage their profiles. The platform also exposes a public API with an interactive playground, supports six languages, and runs in a fully containerized Docker environment secured with a WAF, rate limiting, and HashiCorp Vault.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Technical Stack](#technical-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [Modules](#modules)
- [Project Management](#project-management)
- [Team & Individual Contributions](#team--individual-contributions)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [Resources](#resources)

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) with Docker Compose
- A GitHub OAuth client ID and secret
- A Google OAuth client ID and secret

### Installation

```bash
chmod +x install.sh
./install.sh
```

The interactive installer will prompt you for OAuth credentials, generate secrets, and check for available ports. Once complete, open the app in your browser.

---

## Technical Stack

### Backend

| Technology | Role |
|---|---|
| **Node.js + Express 5** | Application server and API routing |
| **TypeScript** | Type safety across the full stack |
| **PostgreSQL 16** | Relational database |
| **Prisma 7** | ORM with type-safe queries and automatic migrations |
| **Socket.io** | Real-time chat and presence via WebSockets |
| **Passport.js** | OAuth 2.0 (Google, GitHub, 42) |
| **JWT (HTTP-only cookies)** | Session management (XSS-resistant) |
| **bcrypt** | Password hashing (12 salt rounds) |
| **HashiCorp Vault** | Secret management (JWT key, DB credentials, OAuth secrets) |
| **Swagger** | Auto-generated API documentation at `/api-docs` |
| **Helmet / CORS / express-rate-limit** | HTTP hardening and rate limiting |

The API is served under `/api/v1` across seven route groups: **auth**, **profile**, **matches**, **friends**, **chat**, **api-keys**, and **public**. Protected routes verify a JWT from an HTTP-only cookie against a secret stored in Vault; public routes authenticate via SHA-256-hashed API keys sent as Bearer tokens.

### Frontend

| Technology | Role |
|---|---|
| **React + TypeScript** | Component-based UI with compile-time type checking |
| **Vite** | Development server with instant hot reload |
| **TailwindCSS** | Utility-first styling without separate CSS files |
| **React Router** | Client-side navigation |
| **HTML5 Canvas** | Custom Pong game engine |
| **Socket.io Client** | Real-time chat communication |
| **i18n** | Internationalization (6 languages) |
| **React Markdown** | Rendering legal pages from `.md` files |

### Infrastructure

| Technology | Role |
|---|---|
| **Docker + Docker Compose** | Full-stack containerization (frontend, backend, DB, Nginx, Vault) |
| **Nginx** | Reverse proxy and first-layer rate limiting |
| **ModSecurity v3 + OWASP CRS** | Web Application Firewall |
| **Go + tview** | Interactive terminal installer |

---

## Features

| Feature | Description | Contributors |
|---|---|---|
| **Pong Game** | Multiplayer game with AI opponent (3 difficulty levels), keyboard and touch input | sadoming |
| **User Authentication** | Sign up, log in, Google/GitHub/42 OAuth, JWT sessions, CSRF protection | mpietrza, alphbarr, rgiambon |
| **User Profiles** | Customizable profiles with avatar upload, stats, match history, achievements | rgiambon, mpietrza, alphbarr |
| **Real-time Chat** | Direct messaging between friends with online/offline status indicators | mpietrza, rgiambon |
| **Social System** | Friend requests, friend list, online status tracking via Socket.io | rgiambon, mpietrza |
| **Leaderboard** | Player rankings by wins with win-rate tiebreaker | mpietrza, rgiambon |
| **API Playground** | Generate API keys and test public endpoints interactively | mpietrza |
| **Settings** | Account management (update profile, change password) | mpietrza, rgiambon |
| **Internationalization** | 6 languages: English, Spanish, Catalan, French, Italian, Polish | mpietrza |
| **Security** | ModSecurity WAF, rate limiting, Helmet, CORS, Vault secret management | alphbarr |
| **Responsive Design** | Mobile-friendly layout with touch controls for the game | mpietrza |
| **Containerized Deployment** | Full Docker Compose orchestration with multi-stage builds | mfleury |
| **Interactive Installer** | Go-based terminal UI for environment setup | mfleury |
| **Gamification** | Achievements (first game, first win, perfect game, 5 games) and XP/level system | alphbarr, mpietrza, rgiambon |

---

## Database Schema

PostgreSQL database managed via Prisma ORM with 8 models:

| Model | Purpose | Key Relations |
|---|---|---|
| **user** | Authentication and identity | Central entity referenced by all other models |
| **profile** | Public data (name, avatar, bio, level, XP) | 1:1 with user (cascade delete) |
| **match** | Pong game records | N:1 with user; tracks scores, mode, AI level, paddle side |
| **achievement** | Unlockable badges | N:1 with profile; composite unique on `(userId, type)` |
| **friends** | Friendship system | Two N:1 relations to user (sender/receiver); status: `PENDING` or `ACCEPTED` |
| **message** | 1-on-1 chat | Two N:1 relations to user (sender/receiver); composite index for fast history queries |
| **apiKeys** | API key management | N:1 with user (cascade delete) |
| **feedback** | User feedback | N:1 with user (cascade delete) |

### Key Design Decisions

- **Cascade deletes** on most tables ensure clean removal of all user-related data.
- **Unique constraints** prevent duplicate friend requests and duplicate achievement unlocks.
- **Composite indexes** on messages (sender, receiver, timestamp) keep chat history queries fast at scale.
- **Optional password field** supports OAuth-only users (Google, GitHub).
- **Database-level enums** (`PENDING`/`ACCEPTED`, `AI`/`LOCAL`) enforce valid states at the storage layer.

---

## Modules

### Web

| Module | Type | Description |
|---|---|---|
| Framework (frontend + backend) | Major | React/TypeScript frontend with Express backend, Vite build tooling, Docker + Nginx |
| Real-time features | Major | Socket.io for chat, presence, and notifications with JWT-authenticated sockets |
| User interaction | Major | Friends system with requests/acceptance, paginated message history, real-time delivery |
| Public API | Major | 5 endpoints under `/api/v1/public/` with SHA-256 hashed API keys, dual-layer rate limiting, Swagger docs |
| ORM | Minor | Prisma with 8 typed models, database-level enums, and compile-time query validation |
| Design system | Minor | 19+ reusable TailwindCSS components with consistent color palette and semantic tokens |

### Accessibility & Internationalization

| Module | Type | Description |
|---|---|---|
| Multi-language support | Minor | 6 languages via i18n context provider and `useLanguage()` hook |
| Browser compatibility | Minor | Cross-browser support with touch device detection and adaptive game controls |

### User Management

| Module | Type | Description |
|---|---|---|
| Authentication | Major | JWT in HTTP-only cookies, bcrypt hashing, double-submit CSRF tokens |
| Game statistics | Minor | Per-match persistence with computed stats (wins, losses, ranking) |
| OAuth 2.0 | Minor | Google, GitHub, and 42 via Passport.js with Vault-stored credentials |

### Artificial Intelligence

| Module | Type | Description |
|---|---|---|
| AI Opponent | Major | Client-side AI with 3 difficulty levels using predictive ball tracking and tuned error rates |

### Cybersecurity

| Module | Type | Description |
|---|---|---|
| WAF + Vault | Major | ModSecurity v3 with OWASP CRS (tuned for REST/OAuth/Socket.io), HashiCorp Vault for all secrets |

### Gaming & User Experience

| Module | Type | Description |
|---|---|---|
| Pong game engine | Major | Custom TypeScript engine on HTML5 Canvas at 60 FPS with AABB collision detection |
| Gamification | Minor | 4 achievements with automatic unlock, XP system with progressive level thresholds |

### Module of Choice

| Module | Type | Description |
|---|---|---|
| Interactive installer | Minor | Go + tview terminal UI for environment setup, secret generation, and port validation |

---

## Project Management

### Roles

| Member | Role | Expertise |
|---|---|---|
| **mfleury** | Project Manager | DevOps |
| **mpietrza** | Product Owner | Frontend |
| **rgiambon** | Tech Lead | Backend |
| **alphbarr** | Developer | Cybersecurity |
| **sadoming** | Developer | Game Development |

### Process

1. **Product definition** -- The PO led a feature alignment meeting where the team voted on scope using Jira Product Discovery.
2. **Architecture** -- The Tech Lead defined the technology stack and system architecture.
3. **Sprint planning** -- Each expert built a backlog in Jira Scrum; the PM created weekly sprints.
4. **Weekly standups** -- Every Tuesday on MS Teams to review completed work, align priorities, and unblock issues.
5. **Code review** -- All merges to the DEV branch went through GitHub Pull Requests.

### Tools

| Purpose | Tool |
|---|---|
| Communication | MS Teams, Slack |
| Scrum & Product | Jira |
| Documentation | Notion |
| Code Review | GitHub Pull Requests |

---

## Team & Individual Contributions

### mfleury -- DevOps & Project Manager

- Designed and implemented the full Docker orchestration (frontend, backend, Vault, Nginx, PostgreSQL) with multi-stage builds.
- Built a development platform with a tailored `docker-compose` exposing ports and variables for independent frontend/backend testing, plus Makefile commands for Prisma migrations.
- Created the interactive terminal installer from scratch in Go with tview.
- Organized and led weekly sprint meetings.

### rgiambon -- Backend & Tech Lead

- Architected the backend and REST API, designed the PostgreSQL schema (8 models with relationships, enums, and constraints).
- Implemented the public API with SHA-256-hashed API key authentication.
- Built the real-time layer for chat and presence updates using Socket.io.
- Integrated the backend with WAF, Vault, and rate-limiting infrastructure.
- Made key technology stack decisions and supervised structural changes for consistency.

### mpietrza -- Frontend & Product Owner

- Built the entire frontend architecture with React, TypeScript, and TailwindCSS.
- Implemented all major routes (Signup, Login, Home, ToS, Privacy Policy, Settings, Game, Social, Chat) and 19+ reusable components.
- Developed the i18n system supporting 6 languages with a context provider, `useLanguage()` hook, and React Markdown for legal pages.
- Designed the mobile-responsive layout and adapted the game and footer for small screens.
- As PO, led feature scoping, maintained the product backlog, and aligned the team on priorities.

### sadoming -- Game Developer

- Built the complete Pong game engine in TypeScript on HTML5 Canvas with a modular architecture (AI, physics, rendering, objects, settings).
- Implemented 3 AI difficulty levels with predictive tracking and tuned error probabilities.
- Added configurable settings: max points, AI/local mode, difficulty, and paddle side selection.
- Created mobile support with touch slider input and responsive canvas scaling.
- Integrated the standalone game into React with full settings support.
- Early prototype available at: https://sulig.github.io/PONG/

### alphbarr -- Security Architect

- Deployed and tuned ModSecurity v3 with OWASP CRS on Nginx, suppressing false positives on REST, JSON, OAuth, and Socket.io traffic.
- Architected the JWT-in-HTTP-only-cookie flow, Passport strategies, and bcrypt password hashing.
- Implemented double-submit CSRF token protection for all state-changing requests.
- Configured Helmet headers, strict CORS, and dual-layer rate limiting (Nginx + Express).
- Ensured data integrity through Prisma constraints for friends, messages, API keys, and achievements.

---

## AI Usage Disclosure

AI tools were used as a **learning aid** when exploring unfamiliar technologies -- clarifying concepts, understanding documentation, and providing examples. They also assisted with **debugging** (identifying error causes, suggesting alternatives) and **repetitive tasks** (populating i18n translation entries, structuring documentation). All AI-generated suggestions were reviewed and adapted by the team before integration.

---

## Resources

- [Scrum overview (video)](https://www.youtube.com/watch?v=TRcReyRYIMg&t=12s)
- [How to build a PERN app (video)](https://youtu.be/ldYcgPKEZC8)
- [Create a REST API with Node.js and Express (Postman)](https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/)
- [Node.js REST API (W3Schools)](https://www.w3schools.com/nodejs/nodejs_rest_api.asp)
- [Dockerize a Node.js app](https://docs.docker.com/guides/nodejs/containerize/)
- [Socket.io tutorial](https://socket.io/docs/v4/tutorial/introduction)
- [Dockerizing a PERN app](https://medium.com/@zainsaleem022/dockerizing-a-pern-application-using-docker-compose-a60c596c3ba0)
- [HTML5 Canvas game tutorial (W3Schools)](https://www.w3schools.com/graphics/game_canvas.asp)

---

*Built by **alphbarr**, **mfleury**, **mpietrza**, **rgiambon**, and **sadoming** at 42.*
