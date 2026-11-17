import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'STA3032 Mastery Studio | Final Exam Dec 8, 2026',
  description: 'Train scenario recognition, test selection, and decision skills for STA3032.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
