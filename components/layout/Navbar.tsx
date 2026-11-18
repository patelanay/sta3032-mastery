'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { daysUntilExam } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/module-explorer', label: 'Roadmap & Modules' },
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/walkthroughs', label: 'Walkthroughs' },
  { href: '/cloze', label: 'Cloze' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/note-sheet', label: 'Note Sheet' },
  { href: '/weak-spot', label: 'Weak Spot' },
  { href: '/derivation-dojo', label: 'Dojo' },
  { href: '/exam-simulator', label: 'Exam Sim' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const days = daysUntilExam();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-primary-400 font-bold text-lg tracking-tight">
              STA3032
            </span>
            <span className="text-gray-400 text-sm hidden sm:block">Mastery</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-900/60 text-primary-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Exam pill + hamburger */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                days <= 7
                  ? 'bg-danger-900/60 text-danger-300 border-danger-700 animate-pulse'
                  : days <= 14
                  ? 'bg-warn-900/60 text-warn-300 border-warn-700'
                  : 'bg-gray-800 text-gray-300 border-gray-700',
              )}
            >
              ⏰ {days}d to exam
            </span>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-900/60 text-primary-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
                )}
              >
                {label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-800">
            <span className="text-xs text-gray-500">⏰ {days} days until exam</span>
          </div>
        </div>
      )}
    </nav>
  );
}
