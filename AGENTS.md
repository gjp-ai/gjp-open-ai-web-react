# Engineering Harness

This project uses a lightweight local harness to keep generated and hand-written
changes maintainable.

## Architecture

```
src/
├── app/                    # Application shell (App, routes, layouts)
├── pages/                  # Feature-sliced page modules
│   └── Xxx/
│       ├── XxxPage.tsx          # Page component
│       ├── xxx.css              # Page-scoped styles
│       ├── i18n.ts              # Page-specific translations
│       └── components/          # Page-private components
├── shared/
│   ├── components/         # Shared layout components (Footer, Toolbar)
│   ├── contexts/           # React Context with 3-file split (Core → Provider → Hook)
│   ├── data/               # API layer (openApi.ts) + shared types (types.ts)
│   ├── hooks/              # Shared custom hooks (usePagedFetch, etc.)
│   ├── i18n.ts             # Translation registry + useT()
│   └── ui/                 # Primitive UI (Pagination, SearchBar, toggles)
└── index.css               # Global design tokens & base styles
```

### Key Patterns

- **Context split**: `xxxContextCore.ts` (types + createContext) →
  `XxxContext.tsx` (Provider with state) → `useXxx.ts` (consumer hook).
  This preserves React Fast Refresh on Provider edits.
- **Page structure**: Every list page follows
  `Toolbar → skeleton / error / (Grid + Pagination)`.
- **API layer**: All fetch functions live in `shared/data/openApi.ts`.
  Response types live in `shared/data/types.ts`.
- **Translations**: Page-local i18n files register into `shared/i18n.ts`.
  Access translations with `useT()`.
- **Data fetching**: Paginated list pages use the `usePagedFetch` hook from
  `shared/hooks/usePagedFetch.ts` for consistent loading, error, and
  pagination state management.

## Quality Gate

Run before committing UI, data, routing, or infrastructure changes:

```sh
npm run check
```

`npm run check` runs:

- `npm run lint`
- `npm run format:check`
- `npm run build`

## Code Rules

- Follow the **Page → Toolbar → Grid → Card** component hierarchy.
- Page styles go in `src/pages/Xxx/xxx.css`; shared tokens stay in `index.css`.
- Contexts use the **3-file pattern**; never put Provider logic in the Core file.
- Page translations go in `src/pages/Xxx/i18n.ts` and register in `shared/i18n.ts`.
- API functions are centralized in `shared/data/openApi.ts`.
- Every list page must use `<Pagination>` from `shared/ui/`.
- Skeleton loading states must use the `.skeleton` CSS utility classes.
- Search / tag-filter / sort come from `<Toolbar>` — no per-page alternatives.
- Paginated data fetching uses `usePagedFetch` from `shared/hooks/`.
- Avoid `any`; API types live in `shared/data/types.ts`.
- Preserve bilingual i18n behavior when adding visible labels.
- Verify dark and light mode for all UI changes.
- Keep cards and layouts dimensionally stable across desktop and mobile.

## Error Handling

- The app is wrapped with an `ErrorBoundary` to isolate component crashes.
- API errors show `.status--error` with a message and retry button.
- AbortController-based fetch cleanup in all `useEffect` data calls.
- Never swallow errors silently — always surface them in the UI or console.

## Performance

- Page components are lazy-loaded with `React.lazy()` for route-level code splitting.
- All `<img>` tags must use `loading="lazy"`.
- Monitor bundle size with `npx vite-bundle-visualizer` before major merges.
- Prefer CSS transitions over JS animations for hover/focus effects.
- API responses use server-side pagination; avoid client-side-only paging.

## Accessibility

- Interactive elements need `aria-label` or visible text.
- Modals and drawers must trap focus and restore it on close.
- Images must have meaningful `alt` text.
- Keyboard: all clickable elements reachable via Tab.
- Color contrast must meet WCAG AA.

## Review Checklist

- [ ] The app builds without TypeScript errors.
- [ ] ESLint passes without unused disable comments.
- [ ] Prettier formatting passes (`npm run format:check`).
- [ ] New UI states have hover, focus, loading, empty, and dark-mode behavior.
- [ ] Shared behavior is changed in shared modules; page-specific stays in page modules.
- [ ] Generated code follows the existing naming, routing, and CSS conventions.
- [ ] Error and empty states render correctly.
- [ ] New API types are added to `shared/data/types.ts`.
- [ ] Page translations are registered in `shared/i18n.ts`.
- [ ] Accessibility: labels, keyboard, focus management verified.
- [ ] No regressions on mobile breakpoints (≤767px).
