import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daily Routine Reminder',
  description: 'Plan, track, and stay on top of your daily routines with smart reminders.'
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
