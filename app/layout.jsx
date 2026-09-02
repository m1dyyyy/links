export const metadata = {
  title: 'VoteArt',
  description: 'VoteArt Link Protection System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#080c14' }}>
        {children}
      </body>
    </html>
  );
}
