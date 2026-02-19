import './globals.css';

export const metadata = {
  title: 'Portable Workspace',
  description: 'Private, browser-based markdown editor and file manager. All data stays in your browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
