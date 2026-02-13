# PAGES KNOWLEDGE BASE

## OVERVIEW
Route-level UI pages split between storefront screens and admin screens.

## STRUCTURE
```text
src/pages/
├── Main.tsx
├── ProductsPage.tsx
├── ProductDetailPage.tsx
├── CartPage.tsx
├── Login.tsx
├── Search.tsx
├── PaymentPage.tsx
├── UserPage.tsx
├── NotFound.tsx
└── admin/
    ├── Dashboard.tsx
    ├── layout/
    ├── orders/
    └── products/
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Storefront landing | `Main.tsx` | default index route |
| Product list/detail | `ProductsPage.tsx`, `ProductDetailPage.tsx` | catalog routes |
| Checkout/cart | `CartPage.tsx`, `PaymentPage.tsx` | purchase flow |
| Auth/user pages | `Login.tsx`, `LoginRequiredPage.tsx`, `UserPage.tsx` | account flow |
| Admin entry | `admin/Dashboard.tsx` | `/admin` index |
| Admin shell/guard | `admin/layout/AdminLayout.tsx`, `admin/layout/RequireAdmin.tsx` | nested admin routing |
| Admin product ops | `admin/products/AdminProductsList.tsx`, `admin/products/Create.tsx` | product backoffice |

## CONVENTIONS
- Each file generally maps to one route segment in `src/App.tsx`.
- Admin pages are isolated under `admin/` and rendered through admin layout.
- Page-level layout concerns are mostly controlled by wrappers in `src/App.tsx`.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not duplicate admin guards in each admin page; keep access logic in `RequireAdmin`.
- Do not bypass shared layout wrappers when adding new top-level pages.
- Do not introduce route paths here without updating `src/App.tsx` route map.

## NOTES
- This directory is route-heavy and one of the densest frontend areas (11+ page files).
