'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FooterNav() {
  const [isOpen, setIsOpen] = useState(false);
  
  const hoverClass = "transition-colors duration-250 ease-in-out hover:text-[#888888]";

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="fixed bottom-fm-4 left-side-padding z-50 flex flex-col gap-fm-1 items-start uppercase tracking-wide text-base">
      {isOpen && (
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/projects" onClick={closeMenu} className={hoverClass}>
              Projects
            </Link>
          </li>
          <li>
            <Link href="/news" onClick={closeMenu} className={hoverClass}>
              News
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={closeMenu} className={hoverClass}>
              About
            </Link>
          </li>
          <li>
            <Link href="/people" onClick={closeMenu} className={hoverClass}>
              People
            </Link>
          </li>
          <li>
            <Link href="/applications" onClick={closeMenu} className={hoverClass}>
              Applications
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={closeMenu} className={hoverClass}>
              Contact
            </Link>
          </li>
        </ul>
      )}
      <button 
        onClick={toggleMenu} 
        className={`text-[2em] w-[1em] h-[1em] flex items-center justify-center leading-none focus:outline-none ${hoverClass}`}
        aria-label={isOpen ? "Lukk meny" : "Åpne meny"}
      >
        {isOpen ? (
          <svg className="w-[0.7em] h-[0.7em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="w-[0.8em] h-[0.8em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>
    </div>
  );
}
