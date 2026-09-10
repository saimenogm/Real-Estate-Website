import { NextResponse, type NextRequest } from 'next/server';
import { resolveUiMode, UI_MODE_COOKIE, UI_MODE_PARAM } from '@avida/types';

/**
 * Next 16 renamed the middleware file convention to `proxy` (DECISIONS D-09).
 *
 * §6.1 — mode resolution happens here and nowhere else: query param, then
 * cookie, then the env default. In single-page mode "/" is rewritten into the
 * (single) route group, so the visitor's URL stays clean while both modes are
 * served from the same tree.
 */
export function proxy(request: NextRequest) {
  const param = request.nextUrl.searchParams.get(UI_MODE_PARAM);
  const cookie = request.cookies.get(UI_MODE_COOKIE)?.value ?? null;
  const mode = resolveUiMode({
    param,
    cookie,
    envDefault: process.env.NEXT_PUBLIC_UI_MODE_DEFAULT ?? null,
  });

  const headers = new Headers(request.headers);
  // Layout and pages read the resolved mode from here rather than re-deriving it.
  headers.set('x-ui-mode', mode);

  const isHome = request.nextUrl.pathname === '/';
  const response =
    mode === 'single' && isHome
      ? NextResponse.rewrite(new URL('/single', request.url), { request: { headers } })
      : NextResponse.next({ request: { headers } });

  response.headers.set('x-ui-mode', mode);

  // An explicit ?ui= is a deliberate choice; remember it.
  if (param && param === mode) {
    response.cookies.set(UI_MODE_COOKIE, mode, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|fonts|seed-media|favicon.ico).*)'],
};
