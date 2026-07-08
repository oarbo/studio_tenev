import React from 'react';
import { GridSection } from './Layout';

export default function ContactSection() {
  return (
    <GridSection id="contact">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500 mt-fm-4">Contact</h2>
      {/* Rent, venstrestilt teksthierarki */}
      <div className="flex flex-col gap-fm-1 border-t border-black pt-fm-1">
        <h3 className="text-lg font-medium mb-fm-1">Arkitektkontor AS</h3>
        <div className="mb-fm-1">
          <p>Storgata 1</p>
          <p>0150 Oslo</p>
          <p>Norge</p>
        </div>
        <div className="mt-fm-1">
          <p><a href="mailto:hello@arkitektkontor.no" className="hover:underline">hello@arkitektkontor.no</a></p>
          <p><a href="tel:+4712345678" className="hover:underline">+47 12 34 56 78</a></p>
        </div>
      </div>
    </GridSection>
  );
}
