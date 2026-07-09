import React from 'react';

type ContactProps = {
  settings?: {
    studioName?: string;
    address?: string;
    email?: string;
    phone?: string;
    instagram?: string;
  };
};

export default function ContactSection({ settings }: ContactProps) {
  if (!settings) return null;

  return (
    <div className="flex flex-col text-black max-w-[1025px]">
      {/* Blokk 1: Studio og Adresse */}
      <div className="whitespace-pre-line">
        <p className="m-0">{settings.studioName}</p>
        <p className="m-0">{settings.address}</p>
      </div>

      {/* Blanklinje */}
      <div className="h-[37px] w-full" aria-hidden="true" />

      {/* Blokk 2: E-post og Telefon */}
      <div className="flex flex-col">
        {settings.email && (
          <p className="m-0">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
        )}
        {settings.phone && (
          <p className="m-0">
            <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a>
          </p>
        )}
      </div>

      {/* Blanklinje */}
      <div className="h-[37px] w-full" aria-hidden="true" />

      {/* Blokk 3: Instagram */}
      {settings.instagram && (
        <p className="m-0">
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </p>
      )}
    </div>
  );
}
