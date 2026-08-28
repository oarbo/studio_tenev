import React from 'react';
import Link from 'next/link';
import { client, getSiteSettingsQuery } from '@/sanity/client';

import FooterBackToTop from './FooterBackToTop';

export default async function Footer() {
  const siteSettings = await client.fetch(getSiteSettingsQuery).catch(() => null);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full px-side-padding pt-fm-1 pb-fm-1 text-black grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-8 bg-white mt-auto">
      
      {/* Col 1 */}
      <div className="md:col-start-1 md:col-span-3">
        <FooterBackToTop />
      </div>
      
      {/* Col 2 */}
      <div className="md:col-start-5 md:col-span-2">
        <h3 className="mb-[0.7em]">Information</h3>
        <ul className="flex flex-col gap-0">
          <li>
            <Link href="/imprint" className="hover:opacity-70 transition-opacity">
              Terms and conditions
            </Link>
          </li>
          {siteSettings?.instagram && (
            <li>
              <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                Instagram
              </a>
            </li>
          )}
          <li>
            <a href="https://open.spotify.com/playlist/4DvLThK3OudzHCbdONydOL?si=241c0cf23b3b4437" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              Spotify
            </a>
          </li>
          <li>
            <a href="https://no.linkedin.com/company/studio-tenev" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>

      {/* Col 3: Address */}
      <div className="md:col-start-7 md:col-span-2">
        <h3 className="mb-[0.7em]">Address</h3>
        <ul className="flex flex-col gap-0">
          <li>Studio Tenev</li>
          <li>Strandgaten 86</li>
          <li>5004 Bergen</li>
        </ul>
      </div>

      {/* Col 4: Contact */}
      <div className="md:col-start-9 md:col-span-2">
        <h3 className="mb-[0.7em]">Contact</h3>
        <ul className="flex flex-col gap-0">
          <li>
            <a href={`mailto:${siteSettings?.contactEmail || 'daniel@studiotenev.com'}`} className="hover:opacity-70 transition-opacity">
              {siteSettings?.contactEmail || 'daniel@studiotenev.com'}
            </a>
          </li>
          <li>
            <a href="tel:+4795040910" className="hover:opacity-70 transition-opacity">
              +47 950 40 910
            </a>
          </li>
          <li className="mt-[1.4em]">
            &copy; Studio Tenev {currentYear}
          </li>
        </ul>
      </div>

      {/* Col 5: Logo */}
      <div className="md:col-start-11 md:col-span-2">
        <img src="/nal_liggende_rgb_pos.png" alt="NAL Logo" className="w-full max-w-[160px] h-auto grayscale contrast-[500%]" />
      </div>
    </footer>
  );
}
