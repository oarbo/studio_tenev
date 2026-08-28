'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  sticky?: boolean;
  projectTitle?: ReactNode | string;
}

export default function Header({ sticky = false, projectTitle }: HeaderProps) {
  const pathname = usePathname();
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isAtTop || isHoveringTrigger) {
      setIsOpen(true);
    } else if (!isHoveringHeader) {
      // Lukk menyen med forsinkelse hvis musen har forlatt hele headeren
      timeout = setTimeout(() => setIsOpen(false), 1500);
    }
    // Hvis vi ikke er på toppen, ikke hovrer over triggeren, men FREMDELES hovrer over headeren (f.eks. undermenyen),
    // gjør vi ingenting. Dette gjør at den forblir åpen hvis den var åpen, men ikke åpnes hvis den var lukket.

    return () => clearTimeout(timeout);
  }, [isAtTop, isHoveringTrigger, isHoveringHeader]);

  const navLinks = [
    { name: 'Work', href: '/work' },
    { name: 'Studio', href: '/studio' },
    { name: 'News', href: '/news' },
  ];

  return (
    <header 
      className="fixed top-0 left-0 w-full z-[9999] bg-transparent pointer-events-none flex justify-center"
      style={{ paddingTop: '0.7em' }}
    >
      <div 
        className="flex flex-col items-center pointer-events-auto text-black outline-none"
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
      >
        <div 
          className="flex flex-col items-center"
          tabIndex={0}
          onMouseEnter={() => setIsHoveringTrigger(true)}
          onMouseLeave={() => setIsHoveringTrigger(false)}
          onFocus={() => setIsHoveringTrigger(true)}
          onBlur={() => setIsHoveringTrigger(false)}
        >
          {/* Line 1: Site Title */}
          <Link
            href="/"
            className="font-semibold uppercase tracking-[0.1em] whitespace-nowrap transition-opacity hover:opacity-70 leading-tight"
            style={{ fontWeight: 600 }}
          >
            Studio Tenev
          </Link>
          
          {/* Line 2: Navigation Menu */}
          <div 
            className={`grid ${isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]'} transition-all duration-300 ease-out`}
          >
            <div className={`min-h-0 flex justify-center ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'} transition-all duration-200 ease-in`}>
              <nav>
                <ul className="flex gap-[1.5em] justify-center pt-2 leading-tight">
                {navLinks.map((link) => {
                  const isActive = 
                    pathname === link.href || 
                    pathname.startsWith(link.href + '/') ||
                    (link.name === 'Work' && pathname.startsWith('/projects/'));
                    
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${isActive ? 'underline underline-offset-4 decoration-1' : ''}`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            </div>
          </div>
        </div>

        {/* Line 3: Project Title */}
        {projectTitle && (
          <div className="font-semibold whitespace-nowrap text-black leading-tight pt-2" style={{ fontWeight: 600 }}>
            {projectTitle}
          </div>
        )}
      </div>
    </header>
  );
}
