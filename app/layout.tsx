import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DAILY TRAX | Habat Al Rimal Typing Financial Ledger',
  description: 'Daily Financial Tracking & Ledger Application for Habat Al Rimal Typing with real-time Firestore persistence and cost breakdowns.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-100 font-sans text-slate-900 min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
