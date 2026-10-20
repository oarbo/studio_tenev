import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { SanityHotspot } from './SanityImage';

interface LayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  hideHeader?: boolean;
  stickyHeader?: boolean;
  projectTitle?: ReactNode | string;
  projectTitleEn?: string;
  heroImage?: string;
  heroImageLqip?: string;
  heroImageHotspot?: SanityHotspot;
  heroTextColor?: 'auto' | 'white' | 'black';
}

export default function Layout({ 
  children, 
  noPadding = false, 
  hideHeader = false, 
  stickyHeader = false, 
  projectTitle,
  projectTitleEn,
  heroImage,
  heroImageLqip,
  heroImageHotspot,
  heroTextColor,
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen text-[1rem] bg-white text-black relative w-full min-w-0">
      {!hideHeader && (
        <Header 
          sticky={stickyHeader} 
          projectTitle={projectTitle} 
          projectTitleEn={projectTitleEn}
          heroImage={heroImage}
          heroImageLqip={heroImageLqip}
          heroImageHotspot={heroImageHotspot}
          heroTextColor={heroTextColor}
        />
      )}
      <main className={`${noPadding || hideHeader ? '' : 'pt-24 pb-24'} w-full min-w-0 grow`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
