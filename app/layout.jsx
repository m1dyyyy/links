export const metadata = {
  title: 'Загрузка...',
  description: 'Пожалуйста, подождите',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
