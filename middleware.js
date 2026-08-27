import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Твой основной домен (замени на свой, если нужно)
  const currentHost = 'votesaafrt.sbs';

  // Проверяем, это поддомен или нет (например, missleto.votesaafrt.sbs)
  const isSubdomain = hostname.endsWith(`.${currentHost}`) && hostname !== currentHost && hostname !== `www.${currentHost}`;

  if (isSubdomain) {
    // Вытаскиваем само имя поддомена (например, "missleto")
    const subdomain = hostname.replace(`.${currentHost}`, '');

    // Пропускаем системные пути (например, статику Next.js)
    if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    try {
      // Идем в твое API или базу за целевой ссылкой для этого поддомена
      // Важно: на сервере нужен абсолютный путь с протоколом
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const res = await fetch(`${protocol}://${currentHost}/api/save?subdomain=${subdomain}`);
      const data = await res.json();

      if (data && data.url) {
        // НАЙДЕНО! Делаем жесткий редирект на целевую ссылку
        return NextResponse.redirect(data.url, 302);
      }
    } catch (e) {
      console.error('Ошибка редиректа по поддомену:', e);
    }

    // Если поддомен в базе не найден — кидаем на главную панель
    return NextResponse.redirect(`https://${currentHost}`, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
