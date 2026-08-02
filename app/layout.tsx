import type {Metadata} from 'next';
import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'DAILY TRAX | Habat Al Rimal Typing Financial Ledger',
  description: 'Daily Financial Tracking & Ledger Application for Habat Al Rimal Typing with real-time Firestore persistence and cost breakdowns.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans min-h-full antialiased" suppressHydrationWarning>
        <AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider>
      </body>
    </html>
  );
}
