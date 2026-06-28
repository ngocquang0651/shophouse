# Handoff

## Context

Project: LuxeStore Next.js ecommerce app with a local NestJS backend. Recent work focused on the `/chatbot` page using `@assistant-ui/react`, local mock chat APIs, thread history, streaming responses, markdown rendering, and a Codex-like chatbot UI.

## Current Runtime

- Frontend dev server: `npm run dev`
- Backend dev server: `cd backend && npm run start:dev`
- Backend URL: `http://localhost:4000`
- Frontend usually: `http://localhost:3000`
- If port `3000` is occupied, Next may use `http://localhost:3001`

Important note: after running `npm run build` while `next dev` is active, restart the dev server. Next dev cache has produced temporary `.next`/manifest errors before.

## Chatbot Architecture

Main entry:

- `components/Chatbot.tsx` re-exports the modular chatbot.
- `components/chatbot/Chatbot.tsx` wraps providers.
- `components/chatbot/ChatbotRuntimeProvider.tsx` wires assistant-ui runtime and history adapter.
- `components/chatbot/runtime.ts` contains:
  - chat model adapter
  - remote thread list adapter
  - thread metadata mapping
- `components/chatbot/provider/ChatbotProvider.tsx` manages local thread state, active thread, refresh, create, rename, pin, unpin, delete.

Important UI files:

- `components/chatbot/ChatbotShell.tsx`
- `components/chatbot/ChatSidebar.tsx`
- `components/chatbot/ThreadListItem.tsx`
- `components/chatbot/ChatThread.tsx`
- `components/chatbot/composer/ChatComposer.tsx`
- `components/chatbot/composer/ComposerToolbar.tsx`
- `components/chatbot/messages/*`
- `components/chatbot/markdown/MarkdownText.tsx`
- `components/chatbot/tools/*`

## Chatbot UI State

Implemented:

- Codex-like lighter UI.
- Rounded panels/controls through `components/chatbot/constants.ts`.
- User messages have a distinct background.
- Assistant messages render without a bordered card.
- Sidebar thread actions:
  - pin/unpin
  - inline rename
  - delete with confirm
- Composer has a toolbar placeholder for future tools/attachments/settings.
- Tool UI placeholders exist:
  - `ToolCallCard.tsx`
  - `ToolResultBlock.tsx`
  - `ToolStatusBadge.tsx`
- Demo tool rendering now exists:
  - `DemoToolPanel.tsx`
  - reads `message.metadata.custom.demoTools`
  - renders mock tool calls/results inside assistant messages

## API Layer

The frontend API layer now uses axios.

Important files:

- `lib/api.ts`
  - `apiClient`
  - `apiRequest`
  - `apiGet`
  - `apiPost`
  - `apiPatch`
  - `apiDelete`
  - `apiUpload`
  - `ApiError`
  - `toApiError`
- `hooks/useAxios.ts`
  - client hook exposing `data`, `error`, `isLoading`, `request`, `reset`
- `lib/chatbot/api.ts`
  - thread APIs
  - stream API with axios `onDownloadProgress`
  - client-side history normalization before assistant-ui import

Do not pass a custom `auth` key directly into axios config. Axios already uses `auth` for Basic Auth. The project API helpers accept `{ auth: false }` separately and apply auth internally.

## Backend Chat APIs

Backend module: `backend/src/chat`.

Implemented endpoints:

- `GET /chat/threads`
- `POST /chat/threads`
- `GET /chat/threads/:threadId`
- `PATCH /chat/threads/:threadId/name`
- `POST /chat/threads/:threadId/pin`
- `POST /chat/threads/:threadId/unpin`
- `PATCH /chat/threads/:threadId`
- `DELETE /chat/threads/:threadId`
- `GET /chat/threads/:threadId/messages`
- `POST /chat/threads/:threadId/messages`
- `POST /chat/threads/:threadId/messages/stream`
- `POST /chat/threads/:threadId/runs/stream` kept as compatibility alias

Backend data is in-memory mock data. No real model is called. Streamed responses are randomly chunked mock text and are saved to thread history after stream completion.

## Thread Behavior

New thread flow:

- Frontend creates/generates a `threadId`.
- Frontend sends it to backend via `POST /chat/threads`.
- `ensureThread()` in provider/runtime keeps active thread coordinated.
- Clicking a thread loads detail/history from `GET /chat/threads/:threadId`.

Thread metadata:

- `pinned`
- `status`
- `custom.pinned`
- `custom.demo` for seeded demo threads

## Markdown Rendering

Markdown rendering now uses official assistant-ui markdown package:

- `@assistant-ui/react-markdown`
- `remark-gfm`

File:

- `components/chatbot/markdown/MarkdownText.tsx`

Supported markdown/GFM cases:

- headings
- paragraphs
- bold/italic/strike
- inline code
- fenced code blocks
- links
- blockquotes
- unordered/ordered/nested lists
- task lists
- tables
- images
- horizontal rules
- footnotes

Raw HTML is intentionally not enabled because chat content may come from AI/user input and raw HTML can introduce XSS risk.

Known fix already applied:

- Thread history previously crashed with `Cannot read properties of undefined`.
- Root cause was backend history messages missing fields expected by assistant-ui.
- Backend now normalizes messages in `backend/src/chat/chat.service.ts`.
- Frontend also normalizes history in `lib/chatbot/api.ts` before importing into assistant-ui.

Required normalized fields include:

- `metadata.custom`
- user `attachments`
- assistant `status`
- assistant `metadata.unstable_state`
- assistant `metadata.unstable_annotations`
- assistant `metadata.unstable_data`
- assistant `metadata.steps`

## Demo Threads

Backend seeds demo threads on startup:

- `Demo: Tool calls`
- `Demo: Markdown showcase`
- `Demo: Shopping answer format`

Use these from the sidebar to verify markdown history rendering and demo tool-card rendering.

There are also quick prompts:

- `Demo markdown support`
- `Demo tool calls`

`Demo markdown support` triggers a markdown-heavy streamed mock response.

`Demo tool calls` triggers mock ecommerce tools:

- `catalog.search`
- `price.filter`
- `brand.lookup`

The tools are demo-only. They are sent as NDJSON `tools` chunks during streaming and persisted in assistant message metadata so the cards remain visible after thread reload.

## Verification Commands

Frontend:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Backend:

```bash
cd backend
npm run lint
npx tsc --noEmit
npm run build
```

Smoke test backend:

```bash
curl http://localhost:4000/chat/threads
curl http://localhost:4000/chat/threads/demo-markdown-showcase
```

Smoke test frontend:

```bash
curl -I http://localhost:3000/chatbot
curl -I http://localhost:3001/chatbot
```

## Dependencies Added

Frontend dependencies added:

- `axios`
- `@assistant-ui/react-markdown`
- `remark-gfm`

Install warnings seen:

- Node is currently `v21.7.2`.
- Some packages warn about preferred engines `18 || 20 || >=22` or newer.
- npm reported `2 moderate vulnerabilities`; not fixed yet.

## Current Caveats

- Backend chat data is in-memory, so threads reset when backend restarts.
- Demo threads are re-seeded on backend startup.
- Port `3000` may already be occupied by another process; Next will use `3001`.
- `tsconfig.tsbuildinfo` has been modified by TypeScript checks/builds.
- Git worktree contains other changes outside chatbot scope from the broader project; do not revert user changes.

## Good Next Steps

- Replace `window.confirm` delete UX with a proper dialog.
- Add a real dropdown/menu for thread actions if sidebar becomes crowded.
- Add syntax highlighting for code blocks if needed.
- Add real tool call rendering using `components/chatbot/tools/*`.
- Persist chat threads in a database instead of in-memory maps.
- Add automated tests for thread history normalization and stream persistence.
