import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Твой основной домен
  const rootDomain = 'artsvote.sbs';

  // Если это поддомен (например, aa.votesaafrt.sbs)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, '');

    // Пропускаем пустые или www, все остальные сабдомены отправляем в роутер /[slug]
    if (subdomain && subdomain !== 'www') {
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
