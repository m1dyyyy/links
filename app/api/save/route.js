import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { subdomain, url } = await request.json();

    if (!subdomain || !url) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const sql = neon(process.env.POSTGRES_URL);
    const cleanSlug = subdomain.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    await sql`
      INSERT INTO sub_links (subdomain, url)
      VALUES (${cleanSlug}, ${url})
      ON CONFLICT (subdomain) 
      DO UPDATE SET url = ${url};
    `;

    return NextResponse.json({ success: true, slug: cleanSlug });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    return NextResponse.json({ error: 'Ошибка БД' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    // Если запрос идет от middleware для конкретного поддомена
    if (subdomain) {
      const cleanSlug = subdomain.toLowerCase().trim();
      const rows = await sql`
        SELECT url FROM sub_links 
        WHERE LOWER(TRIM(subdomain)) = ${cleanSlug}
      `;

      if (rows && rows.length > 0 && rows[0].url) {
        let targetUrl = rows[0].url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = `https://${targetUrl}`;
        }
        return NextResponse.json({ url: targetUrl });
      }

      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Иначе отдаем весь список для панели управления (последние 50 штук)
    const rows = await sql`SELECT subdomain, url FROM sub_links ORDER BY id DESC LIMIT 50`;
    return NextResponse.json({ links: rows });
  } catch (error) {
    console.error('Ошибка загрузки из БД:', error);
    return NextResponse.json({ links: [], error: 'Ошибка БД' }, { status: 500 });
  }
}
