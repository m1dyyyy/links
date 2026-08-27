import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { subdomain, url } = await request.json();

    if (!subdomain || !url) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

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

export async function GET() {
  try {
    const { rows } = await sql`SELECT subdomain, url FROM sub_links ORDER BY id DESC LIMIT 50`;
    return NextResponse.json({ links: rows });
  } catch (error) {
    return NextResponse.json({ links: [] });
  }
}
