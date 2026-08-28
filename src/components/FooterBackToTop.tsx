'use client';

import React from 'react';

export default function FooterBackToTop() {
  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="hover:opacity-70 transition-opacity text-left block"
    >
      Back to top
    </button>
  );
}
