'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import FooterBackToTop from './FooterBackToTop';
import LanguageSwitcher from './LanguageSwitcher';

interface FooterClientProps {
  instagram?: string;
  studioName?: string;
  address?: string;
  contactEmail?: string;
  phone?: string;
  phoneHref?: string;
  currentYear: number;
}

export default function FooterClient({
  instagram,
  studioName = 'Studio Tenev',
  address,
  contactEmail = 'hello@studiotenev.com',
  phone = '+47 950 40 910',
  phoneHref = 'tel:+4795040910',
  currentYear,
}: FooterClientProps) {
  const { t } = useLanguage();

  return (
    <footer className="w-full px-side-padding pt-fm-1 pb-fm-1 text-black grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-8 bg-white mt-auto">
      {/* Col 1 */}
      <div className="md:col-start-1 md:col-span-3">
        <FooterBackToTop />
      </div>

      {/* Col 2: Information */}
      <div className="md:col-start-4 md:col-span-2">
        <h3 className="mb-[0.7em]">{t('information')}</h3>
        <ul className="flex flex-col gap-0">
          <li>
            <Link href="/imprint-and-privacy-policy" prefetch={true} className="hover:opacity-70 transition-opacity">
              {t('privacyPolicy')}
            </Link>
          </li>
          {instagram && (
            <li>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                Instagram
              </a>
            </li>
          )}
          <li>
            <a
              href="https://open.spotify.com/playlist/4DvLThK3OudzHCbdONydOL?si=241c0cf23b3b4437"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Spotify
            </a>
          </li>
          <li>
            <a
              href="https://no.linkedin.com/company/studio-tenev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </div>

      {/* Col 3: Address */}
      <div className="md:col-start-6 md:col-span-2">
        <h3 className="mb-[0.7em]">{t('address')}</h3>
        <ul className="flex flex-col gap-0">
          <li>{studioName}</li>
          {address ? (
            <li className="whitespace-pre-wrap">{address}</li>
          ) : (
            <>
              <li>Strandgaten 86</li>
              <li>5004 Bergen</li>
            </>
          )}
        </ul>
      </div>

      {/* Col 4: Contact */}
      <div className="md:col-start-8 md:col-span-2">
        <h3 className="mb-[0.7em]">{t('contact')}</h3>
        <ul className="flex flex-col gap-0">
          <li className="whitespace-nowrap">{contactEmail}</li>
          <li className="whitespace-nowrap">{phone}</li>
          <li className="mt-[1.4em]">
            &copy; {studioName} {currentYear}
          </li>
        </ul>
      </div>

      {/* Col 5: Language & Logo */}
      <div className="md:col-start-10 md:col-span-3 flex flex-col items-start">
        <div className="hidden md:block mb-[0.7em] select-none invisible" aria-hidden="true">
          &nbsp;
        </div>
        <LanguageSwitcher />
        <div className="mt-[calc(1.4em-20px)] -ml-[15px]">
          <img
            src="/nal_liggende_rgb_pos.png"
            alt="NAL Logo"
            width={160}
            height={42}
            loading="lazy"
            className="w-[154px] max-w-none h-auto grayscale contrast-[500%] object-contain block"
          />
        </div>
      </div>
    </footer>
  );
}
