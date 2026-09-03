import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export default async function RedirectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug || slug === 'favicon.ico' || slug === 'api') return null;

  let targetUrl = null;

  try {
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!dbUrl) return null;

    const sql = neon(dbUrl);
    const cleanSlug = String(slug).toLowerCase().trim();

    const rows = await sql`
      SELECT url FROM sub_links 
      WHERE LOWER(TRIM(subdomain)) = ${cleanSlug}
    `;

    if (rows && rows.length > 0 && rows[0].url) {
      targetUrl = rows[0].url;
    }
  } catch (error) {
    console.error('Ошибка обращения к БД:', error);
  }

  if (targetUrl) {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Инкремент кликов в базе
    try {
      const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
      const sql = neon(dbUrl);
      const cleanSlug = String(slug).toLowerCase().trim();
      await sql`
        UPDATE sub_links 
        SET clicks = COALESCE(clicks, 0) + 1 
        WHERE LOWER(TRIM(subdomain)) = ${cleanSlug}
      `;
    } catch (err) {
      console.error('Ошибка инкремента клика:', err);
    }

    // Возвращаем HTML со статусом 200 OK + бессекундный JS-редирект
    return (
      <html lang="ru">
        <head>
          <meta charSet="utf-8" />
          <title>Загрузка...</title>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.replace(${JSON.stringify(targetUrl)});`,
            }}
          />
        </head>
        <body style={{ backgroundColor: '#080c14', margin: 0 }} />
      </html>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#080c14',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
        Ссылка не найдена или устарела
      </h2>
    </main>
  );
}
