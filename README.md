<b>
   
### Need to Install

- [Docker](https://www.docker.com/) and Docker Compose

</b>
<b>

### Detailed explanations on the architecture

Read this before, perhaps the answer to your question is already here! More details about the structure are explained here.
https://www.notion.so/Docker-services-2cbaa892ab4b8030b2dbce06ca8cfc09

### Create and populate the environment variables files

The values of the variables must be shared privately so you'll have to ask me for them. We can use the service share.doppler.com to share env values securely.

1. In the root folder, create a .env and a .env.development ile and put in it all the variables that you find in ./.env.example. 
2. Move into nginx/ folder, delete the ssl folder if already existing and run ./generate-ssh.sh
3. Back to root folder, run ./scripts/setup-secrets.sh to create secret files. 5 empty secret files are created
4. Now populate those files: 
    - for github and google files, do 'echo "the_secret_key" > secrets/google_xxxx' for each file
    - for passwords and token files, 'openssl rand -hex 32 > secrets/the_file_to_feed'for each file

</b>
<b>

### Run the containers with Makefile

Simply type make to launch a production environment.The website can be tested on https://localhost:NGINX_PORT_HTTPS

make help provide a brief description of available make commands.

this links provides more details explanations: https://www.notion.so/Docker-services-2cbaa892ab4b8030b2dbce06ca8cfc09?source=copy_link#2eeaa892ab4b801fb45bf01738d7b7ce

### And that's it!
That's it basically, you can start working accessing the website through the browser while everything will run on containers in detached mode so you will be able to use the terminal :D

</b>

**Access API Documentation:**
-  Go to `http://localhost:3001/api-docs` to view the Swagger API documentation.

---

## Frontend

### Technologies and Frameworks

| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI framework — component-based SPA |
| **TypeScript** | 5.9 | Static typing across the entire frontend |
| **Vite** | 7 | Build tool and dev server |
| **Tailwind CSS** | 4 | Utility-first CSS framework with custom design tokens |
| **React Router** | 7 | Client-side routing with protected routes |
| **Axios** | 1.13 | HTTP client for REST API communication |

### Other Significant Libraries

| Library | Purpose |
|---|---|
| **react-markdown** | Renders the Terms of Service and Privacy Policy pages from per-language Markdown files |
| **HTML5 Canvas API** | Powers the Pong game rendering (ball physics, paddles, collision detection at 60 FPS) |

### Justification for Major Technical Choices

- **React + TypeScript**: Chosen for type safety across components, props, API responses, and shared interfaces. Catches errors at compile time instead of runtime.
- **Tailwind CSS v4 with `@theme`**: Allows defining a custom design system (color palette, typography) as CSS variables that Tailwind classes reference directly. No separate theme config file needed — all tokens live in `index.css` and are used via classes like `bg-bg-primary`, `text-accent-purple`, `font-pixel`.
- **React Context**: The app has two global concerns (auth state and language). React Context handles both without adding a state management dependency. `AuthContext` holds the logged-in user; `LanguageContext` holds the current language and translation strings.
- **Axios instances per domain**: Three separate axios instances (`auth.ts`, `profile.ts`, `matches.ts`) each pre-configured with the correct base URL and `withCredentials: true`. This avoids repeating configuration on every API call.
- **Cookie-based sessions**: Authentication uses HTTP-only cookies managed by the backend.
- **Custom i18n system**: A lightweight translation system using a single `translations.ts` file with nested objects per language. No external i18n library needed — `useLanguage()` returns the `t` object for the current language, and components access strings like `t.header.home`.

### Implemented Features

#### Authentication
- **Registration** — Email/password sign-up with name, email validation, and minimum 12-character password requirement.
- **Login** — Email/password sign-in with error feedback.
- **OAuth** — One-click login via GitHub and Google.
- **Session persistence** — On page load, the app calls `GET /auth/me` to restore the session from the cookie. No manual token handling.
- **Logout** — Clears the server session and redirects to home.

#### Pong Game
-** ----- Add description of game itself ---- **
- **Game settings** — Configure play mode (vs AI or Local 1v1), AI difficulty (Easy/Medium/Hard), guest name, points to win (3/5/7/10), and paddle side (Left/Right).
- **Match recording** — Each game creates a match record via the API. Results are saved when the game ends.
- **Result screen** — Displays the winner and score with options to rematch, start a new game, or return home.

#### User Profile
- **Profile page** — Displays avatar, name, bio, level badge, and XP progress bar.
- **View other profiles** — Navigate to `/profile/:id` to see another user's profile and stats.
- **Statistics grid** — Shows games played, wins, losses, and rank using reusable Card components.
- **Achievements** — Four achievement badges (First Game, First Win, Perfect Game, 5 Games) that highlight when unlocked.
- **XP progression** — Visual progress bar showing XP within the current level, with calculated thresholds per level.
- **Match history** — Table of all past matches showing opponent (AI level or guest name), score, win/loss result, and date. Sorted by most recent. Visible on own profile and other users' profiles.

#### Account Settings
- **Avatar upload** — Change profile picture (PNG/JPEG)
- **Edit name** — Update display name, synced across the app via AuthContext.
- **Edit bio** — Update bio text (255 character limit).
- **Change password** — Current password verification, new password with confirmation, minimum 12-character validation.

#### Chat
- ** ----- To implement ----- **

#### Leaderboard
- **Rankings table** — Fetches top players from `GET /matches/leaderboard`. Displays rank, avatar, name, level, wins, and win rate. Player names link to their profiles.

#### Internationalization (i18n)
- **6 languages** — English, Spanish, Catalan, French, Italian, Polish.
- **Language selector** — Dropdown in the footer to switch languages. All UI strings update immediately.
- **Localized legal pages** — Terms of Service and Privacy Policy are separate Markdown files per language, rendered with react-markdown. Falls back to English if a translation is missing.

#### Custom Design System
- **Color palette** — 9 design tokens: 2 background shades (#050505, #0e0e0e), 3 accent colors (gold #ffcc00, green #33ff33, light green #66ff66), 3 text levels (primary, secondary, muted).
- **Typography** — VT323 (pixel/retro for headings) and Space Mono (monospace for body text).
- **Reusable components** — 19 components total:
  - **UI primitives**: Button (5 variants: primary, secondary, outline, danger, ghost), Card (with highlight/dimmed states)
  - **Layout**: Header (sticky, with slide-in sidebar menu), Footer (with language selector)
  - **Icons** (7): GoogleIcon, OctocatIcon, EyeIcon, EyeOffIcon, MenuIcon, CloseIcon, SendIcon
  - **Feature components**: LogInForm, SignUpForm, ProfileHeader, StatsGrid, Achievements, Leaderboard, ChatBox, LanguageSelector, UserAvatar, FileUploader
  

#### Navigation
- **Sidebar menu** — Slide-in overlay from the right with links to Home, New Game, Chat, Profile, Settings, and Logout.


