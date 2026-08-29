import { neon } from '@neondatabase/serverless';

function getSql() {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Не найдена переменная подключения к БД (POSTGRES_URL / DATABASE_URL)');
  return neon(dbUrl);
}

// Вспомогательная функция для ленивого создания таблицы и колонки
async function ensureTableAndColumns(sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sub_links (
        id SERIAL PRIMARY KEY,
        subdomain TEXT UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INT DEFAULT 0
      ;
    `;
    // На всякий случай проверяем и добавляем колоночку clicks, если старая таблица уже была без нее
    await sql`
      ALTER TABLE sub_links ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0;
    `;
  } catch (e) {
    console.error('Ошибка инициализации таблицы:', e);
  }
}

// GET: Получение всех ссылок со счетчиком кликов
export async function GET() {
  try {
    const sql = getSql();
    await ensureTableAndColumns(sql);

    const links = await sql`
      SELECT subdomain, url, COALESCE(clicks, 0) as clicks 
      FROM sub_links 
      ORDER BY id DESC
    `;
    return Response.json({ links });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Создание новой ссылки / потока
export async function POST(request) {
  try {
    const { subdomain, url } = await request.json();

    if (!subdomain || !url) {
      return Response.json({ error: 'Заполни все поля' }, { status: 400 });
    }

    const cleanSub = String(subdomain).toLowerCase().trim();
    const cleanUrl = String(url).trim();

    const sql = getSql();
    await ensureTableAndColumns(sql);

    // Вставляем или обновляем, если сабдомен уже занят
    await sql`
      INSERT INTO sub_links (subdomain, url, clicks) 
      VALUES (${cleanSub}, ${cleanUrl}, 0)
      ON CONFLICT (subdomain) 
      DO UPDATE SET url = ${cleanUrl}
    `;

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
