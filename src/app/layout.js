import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Empressario — Mentorship Portal',
  description: 'Connect startups with experienced mentors. Empressario bridges the gap between ambitious founders and seasoned investors through structured, ongoing mentorship.',
  keywords: 'mentorship, startups, angel investors, venture capital, mentoring platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
