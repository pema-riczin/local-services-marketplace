# Project Guidance

## User Preferences

[No preferences set — the PM adds these from user requests]

## Accepted Requirements

- Provider profiles with name, service category, description, hourly rate, location, and photo
- Searchable and filterable directory of providers by category and location
- Reviews and ratings system with star ratings and written reviews on providers
- Booking requests with date, time, and message, with provider accept or decline
- Built-in management panel for adding, editing, and removing providers, categories, and reviews
- Sample content seeding example providers and reviews

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Provider and category ids are Motoko Nat values that arrive in the browser as BigInt; React Query hashes keys with JSON.stringify, which throws on bigint. Give the filter object a toJSON that emits string ids while the actor still reads the bigint.
- Seed sample content from the actor body in main.mo guarded by a persisted seeded flag; a query function cannot persist a seed, and an admin-gated seed endpoint with no UI caller never runs.
- A backend authorization change is incomplete until the frontend control that gates the same action is updated; keep the two in sync.
- Review edit/delete mutations must invalidate the provider detail query key, not just the reviews list, or the average rating stays stale.
- Guard decorative and loading animations with motion-safe: (animate-spin, animate-pulse) so they honor prefers-reduced-motion.
- When backend.d.ts lacks methods the backend source implements, run mops build then pnpm run bindgen to regenerate bindings before writing UI.
- No Toaster is mounted in App.tsx; use inline success/error state instead of sonner toast in pages.
