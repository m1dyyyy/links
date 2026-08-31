'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/save');
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch (err) {
      console.error('Ошибка при загрузке ссылок:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при создании ссылки');
      }

      setUrl('');
      setSubdomain('');
      fetchLinks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (subdomain, index) => {
    const fullUrl = `https://${subdomain}.consi.sbs`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#07090e',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Шапка */}
      <div style={{ textAlign: 'center', marginBottom: '36px', maxWidth: '480px' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          SECURE TDS SYSTEM
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          SYDAR Links
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
          Современная панель управления потоками и редиректами
        </p>
      </div>

      {/* Карточка создания */}
      <div style={{
        backgroundColor: '#0b1120',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid #1e293b',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        marginBottom: '32px'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
              ЦЕЛЕВАЯ ССЫЛКА (ОФФЕР)
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
              ПОДДОМЕН / СЛАГ
            </label>
            <input
              type="text"
              placeholder="missleto"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />
          </div>

          {error && (
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            {loading ? 'Создание...' : 'Создать поток'}
          </button>
        </form>
      </div>

      {/* Список активных ссылок */}
      <div style={{ width: '100%', maxWidth: '460px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', margin: 0, letterSpacing: '0.5px' }}>
            АКТИВНЫЕ ПОТОКИ
          </h3>
          <span style={{ fontSize: '12px', color: '#475569', backgroundColor: '#0b1120', padding: '2px 8px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            {links.length} шт.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {links.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#475569', fontSize: '13px', backgroundColor: '#0b1120', borderRadius: '12px', border: '1px solid #1e293b' }}>
              Пока нет созданных потоков
            </div>
          ) : (
            links.map((item, idx) => {
              const fullLink = `https://${item.subdomain}.consi.sbs`;
              const clicksCount = item.clicks || 0;

              return (
                <div key={idx} style={{
                  backgroundColor: '#0b1120',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.2s'
                }}>
                  <div style={{ overflow: 'hidden', paddingRight: '12px', flex: 1 }}>
                    <a
                      href={fullLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#60a5fa',
                        fontWeight: '600',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all',
                        marginBottom: '4px'
                      }}
                    >
                      {fullLink}
                    </a>
                    <div style={{
                      color: '#64748b',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '6px'
                    }}>
                      → {item.url}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                      <span>👁</span>
                      <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{clicksCount}</span>
                      <span style={{ color: '#475569' }}>переходов</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(item.subdomain, idx)}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#1e293b'}
                  >
                    {copiedIndex === idx ? 'Готово!' : 'Копировать'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
