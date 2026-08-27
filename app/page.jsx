'use client';

import { useState, useEffect } from 'react';

export default function SydarLinks() {
  const [targetUrl, setTargetUrl] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [links, setLinks] = useState([]);
  const [toast, setToast] = useState('');

  const loadLinks = async () => {
    try {
      const res = await fetch('/api/save');
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch (e) {}
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!targetUrl.trim() || !subdomain.trim()) return;

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomain.trim(), url: targetUrl.trim() }),
      });

      if (res.ok) {
        setTargetUrl('');
        setSubdomain('');
        showToast('Ссылка создана!');
        loadLinks();
      }
    } catch (err) {
      showToast('Ошибка создания');
    }
  };

  const copyLink = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Ссылка скопирована!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080c14',
      color: '#f1f5f9',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 16px'
    }}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#2563eb',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 100
        }}>
          {toast}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
            SYDAR Links
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Генератор ссылок: (тут название ссылок ну поддоменов)
          </p>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '32px'
        }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' }}>
                Целевая ссылка
              </label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' }}>
                Поддомен
              </label>
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="missleto"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: '700',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '8px'
              }}
            >
              Создать ссылку
            </button>
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Активные ссылки
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {links.map((item) => (
              <div
                key={item.subdomain}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>
                    {item.subdomain}/vercell.app
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    → {item.url}
                  </div>
                </div>

                <button
                  onClick={() => copyLink(item.subdomain)}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Копировать
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
