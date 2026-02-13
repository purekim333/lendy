# FRONTEND KNOWLEDGE BASE

## OVERVIEW
Create React App TypeScript SPA with two UI domains: storefront routes and admin routes under `/admin`.

## STRUCTURE
```text
frontend/
├── src/
│   ├── pages/           # storefront + admin pages
│   ├── components/      # shared UI pieces
│   ├── assets/          # images/icons
│   ├── types/           # Product/Cart types
│   ├── util/, utils/    # API/cart helpers
│   └── services/        # integration services
├── public/
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App bootstrap | `src/index.tsx` | mounts `App` with `BrowserRouter` |
| Route composition | `src/App.tsx` | storefront layouts + `/admin` subtree |
| Shared header/nav | `src/components/Header.tsx` | storefront shell control |
| Admin guard | `src/pages/admin/layout/RequireAdmin.tsx` | admin access gate |
| Admin shell | `src/pages/admin/layout/AdminLayout.tsx` | sidebar + nested outlet |
| Product typing | `src/types/Product.ts` | shared catalog type |
| Cart typing | `src/types/Cart.ts` | cart item contracts |
| Cart persistence helper | `src/utils/cartStorage.ts` | local cart state IO |

## CONVENTIONS
- TypeScript is strict and `noEmit` (`tsconfig.json`).
- Routing is centralized in `src/App.tsx`; page files stay under `src/pages`.
- Admin pages are nested under `src/pages/admin/*` and mounted under `/admin` routes.
- Styling uses Tailwind utility classes plus app-level CSS files.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not split route definitions across random files; keep primary route map in `src/App.tsx`.
- Do not assume CRA defaults include custom lint/format rules beyond `react-app` presets.
- Do not add API path assumptions that bypass gateway `/api/` behavior.

## UNIQUE STYLES
- Single SPA hosts both storefront and admin experiences.
- `src/App.tsx` contains custom layout wrappers (`LayoutWithHeader`, `LayoutWithoutHeader`).
- Asset-heavy UI (header/login/main visuals) is colocated in `src/assets`.

## COMMANDS
```bash
cd frontend && npm ci
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

## NOTES
- `frontend/Dockerfile` is referenced by CI but missing from this repo snapshot.
- `src/index.tsx` intentionally renders without `React.StrictMode` wrapper.
