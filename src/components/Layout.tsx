import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  hideHeader?: boolean;
  stickyHeader?: boolean;
  projectTitle?: ReactNode | string;
}

export default function Layout({ children, noPadding = false, hideHeader = false, stickyHeader = false, projectTitle }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-[1rem] bg-white text-black relative w-full min-w-0">
      {!hideHeader && <Header sticky={stickyHeader} projectTitle={projectTitle} />}
      <main className={`${noPadding || hideHeader ? '' : 'pt-35 pb-35'} w-full min-w-0 grow`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
