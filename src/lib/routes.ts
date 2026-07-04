export const AUTH_PAGES = ["/login", "/register"] as const;

export const PROTECTED_ROUTES = ["/dashboard", "/topics"] as const;

export const MIDDLEWARE_MATCHER = [
  ...PROTECTED_ROUTES.flatMap((r) => [r, `${r}/:path*`] as const),
  ...AUTH_PAGES,
];

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}
