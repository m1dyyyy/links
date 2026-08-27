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

  const handleCopy = (slug, index) => {
    const fullUrl = `https://${slug}.votesaafrt.sbs`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#080c14',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '60px',
      paddingBottom: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SYDAR Links</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Генератор ссылок (рекламные редиректы)
        </p>
      </div>

      <div style={{
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #1e293b',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              Целевая ссылка
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              Поддомен / Слаг
            </label>
            <input
              type="text"
              placeholder="missleto"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? 'Создание...' : 'Создать ссылку'}
          </button>
        </form>
      </div>

      <div style={{ width: '100%', maxWidth: '440px', marginTop: '32px', padding: '0 16px', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Активные ссылки</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {links.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>Пока нет созданных ссылок</p>
          ) : (
            links.map((item, idx) => {
              const fullLink = `https://${item.subdomain}.votesaafrt.sbs`;

              return (
                <div key={idx} style={{
                  backgroundColor: '#0f172a',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ overflow: 'hidden', paddingRight: '12px' }}>
                    <a
                      href={fullLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3b82f6',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                    >
                      {fullLink}
                    </a>
                    <div style={{
                      color: '#64748b',
                      fontSize: '13px',
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      → {item.url}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.subdomain, idx)}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      border: '1px solid #334155',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {copiedIndex === idx ? 'Скопировано!' : 'Копировать'}
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
