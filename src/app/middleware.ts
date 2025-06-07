import { NextResponse } from 'next/server';

import { REDIRECT_SITE } from '@/constants/constants';

/**
 * Для любых запросов возвращаем permanent redirect 301 на заданный сайт REDIRECT_SITE
 */
export function middleware() {
  return NextResponse.redirect(REDIRECT_SITE, 301);
}

export const config = {
  matcher: ['/:path*'], // можно сузить список обрабатываемых путей
};
