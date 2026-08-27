# Kotoba

Kotoba is a small front-end blog app built with Next.js, TypeScript, Redux Toolkit, and Tailwind CSS. It seeds posts from a public API, then lets the reader create, edit, delete, like, search, filter, and revisit posts with all reader-owned changes persisted in the browser.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run build
npm run lint
npm run typecheck
npm test
```

## Features

- Seeded posts from DummyJSON.
- Responsive blog index with search, category tabs, loading skeletons, empty states, and error state.
- Full post detail pages with like/unlike, edit, delete, and recently viewed tracking.
- Local create and edit forms using `react-hook-form` and `zod`.
- Delete confirmation plus undo toast.
- Homepage with featured posts, recently viewed posts, and a random post action.
- Theme toggle with persisted preference.
- Browser persistence for local posts, edits, deletions, likes, recently viewed posts, and theme.

## API Choice

The original assignment allowed a public API substitute. I used DummyJSON instead of a RapidAPI-backed service because it requires no API key. This matters for a front-end-only app: a client-side API key would be exposed in the browser bundle unless a backend or server route acted as a proxy.

DummyJSON also provides useful real data for a blog app:

- `/posts/tag/{history,crime,fiction}` for category-based seed posts.
- `/users?limit=0&select=firstName,lastName,image` for bylines and avatars.

DummyJSON posts do not include timestamps, so seeded posts receive deterministic generated dates. That keeps sorting stable across reloads without pretending the API supplied dates it does not have.

## State And Persistence Model

The app does not persist a single merged array of posts. Seeded API data and reader changes are stored separately:

```txt
remote      fetched posts, not persisted
local       reader-created posts, persisted
edits       overrides for seeded posts, persisted
deletedIds  tombstones for deleted posts, persisted
```

`selectAllPosts` merges those layers at read time:

```txt
remote posts
- deleted ids
+ edits layered on matching remote posts
+ local posts
sorted newest first
```

This keeps the API feed fresh while preserving the reader's changes. For example, editing or deleting an API-sourced post survives a reload without freezing the entire seed feed in localStorage.

Persistence is handled through a small localStorage layer and Redux listener middleware. Only reader-owned state is written: local posts, edits, deleted IDs, likes, recently viewed posts, and theme. Reads and writes are best-effort so unavailable storage does not break the app.

## Trade-Offs

- Filters live in Redux rather than URL query params. That keeps the Redux data flow explicit for this assignment; URL sync would also be good.
- Seed data is fetched client-side. Server-side seed rendering would need different caching and error-handling decisions.
- Recently viewed is stored as a capped list, so local view count adds one when a post has been viewed by the reader; it is not an unlimited per-post analytics counter.
- There is no pagination. The current seed size is small enough for local filtering and rendering.

## What I Would Improve Next

- Add URL-synced search/category filters.
- Add pagination or infinite scroll if the feed grows.
- Replace `window.localStorage` persistence with a small IndexedDB layer for larger drafts.
- Add more component-level tests for forms, delete undo, and theme behavior.
- Add richer author handling for locally written posts.
- Evaluate whether Redux is still worth the boilerplate for this app. React Context could cover simple app-wide UI state, while Zustand would be a good fit if the app keeps selectors, persistence, and more structured client state.
- As the app grows, reorganize `components/` into domain and shared UI folders. The current flat structure is fine at this size, but grouping post, layout, filter, and reusable UI components would make ownership clearer.

## Design Rationale
Kotoba means “word” or “language” in Japanese, which shaped the app as a quiet, text-first reading and writing space. The interface keeps decoration restrained so posts stay easy to scan and comfortable to read. The palette, spacing, and typography are intentionally quiet, with stronger contrast reserved for actions, focus states, and theme controls.

The app supports system, dark, and high-contrast themes. System mode follows the reader’s OS preference, dark mode supports low-light reading, and high-contrast mode improves accessibility for readers who need clearer visual separation.
