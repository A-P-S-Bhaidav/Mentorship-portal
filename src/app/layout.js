import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'VentureUp — Structured Mentorship for Ambitious Startups',
  description: 'VentureUp connects high-potential startups with experienced Angel Investors and VC professionals for guided growth, smart matching, and actionable insights.',
  keywords: 'VentureUp, mentorship, startups, angel investors, venture capital, mentoring platform',
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
