import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const fredoka = Fredoka({ variable: '--font-fredoka', subsets: ['latin'], weight: ['500', '600', '700'] });
const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Sprout · grow your software skills', template: '%s · Sprout' },
  description:
    'Bite-sized, playful mini-courses on software engineering, AI coding agents and the soft skills around them.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-screen text-ink">{children}</body>
    </html>
  );
}
