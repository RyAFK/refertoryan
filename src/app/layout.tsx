import type { Metadata } from 'next';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReturnToRyan — Eye Clinic London Referral Portal',
  description: 'Secure referral portal for optometrists referring patients to Eye Clinic London.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <DemoModeBanner />
        {children}
      </body>
    </html>
  );
}
