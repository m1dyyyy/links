import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';

// Принудительно включаем динамический режим для редиректов
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
    redirect(targetUrl);
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#080c14',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ссылка не найдена</h2>
    </main>
  );
}
