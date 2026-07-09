import React, { ReactNode } from 'react';
import Link from 'next/link';
import FooterNav from './FooterNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  return (
    <div className="min-h-screen text-base bg-white text-black relative w-full min-w-0">
      <header className="fixed top-0 left-0 p-side-padding py-fm-1 z-60 bg-transparent">
        <Link href="/" className="font-medium whitespace-nowrap">Studio Tenev</Link>
      </header>
      <main className="pt-fm-4 w-full min-w-0">
        {children}
      </main>
      <FooterNav />
    </div>
  );
}
