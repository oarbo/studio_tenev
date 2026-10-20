'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps = {}) {
  const { locale } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  // Honeypot for spam bots
  const [botField, setBotField] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isEn = locale === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (botField) {
      // Bot detected, silently fake success
      setStatus('success');
      onSuccess?.();
      return;
    }

    if (!name.trim() || !email.trim()) {
      setStatus('error');
      setErrorMessage(
        isEn
          ? 'Please fill in your name and email address.'
          : 'Vennligst fyll ut navn og e-postadresse.'
      );
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Kunne ikke sende melding');
      }

      setStatus('success');
      onSuccess?.();
    } catch {
      setStatus('error');
      setErrorMessage(
        isEn
          ? 'Sorry, an error occurred while sending. Please contact us directly at daniel@studiotenev.com.'
          : 'Beklager, det oppstod en feil under sending. Vennligst send oss en e-post direkte til daniel@studiotenev.com.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="pt-8 pb-12 border-t border-b border-black">
        <h2 className="font-normal mb-4">
          {isEn ? 'Thank you for reaching out' : 'Takk for din henvendelse'}
        </h2>
        <p className="mb-6 leading-(--line-height)">
          {isEn
            ? 'We have received your message and will get back to you as soon as possible to discuss your project.'
            : 'Vi har mottatt meldingen din og vil ta kontakt så snart som mulig for å diskutere prosjektet.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
            setStatus('idle');
          }}
          className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer text-[1rem]"
        >
          {isEn ? 'Send another inquiry →' : 'Send en ny henvendelse →'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
      {/* Honeypot field (hidden from real users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Navn */}
      <div>
        <input
          id="contact-name"
          aria-label={isEn ? 'Name' : 'Navn'}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isEn ? 'Name *' : 'Navn *'}
          className="w-full bg-transparent border-b border-black pb-2 text-[1rem] text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors"
        />
      </div>

      {/* E-post og Telefon (2 kolonner på desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <input
            id="contact-email"
            aria-label={isEn ? 'Email' : 'E-post'}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isEn ? 'Email *' : 'E-post *'}
            className="w-full bg-transparent border-b border-black pb-2 text-[1rem] text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors"
          />
        </div>

        <div>
          <input
            id="contact-phone"
            aria-label={isEn ? 'Phone' : 'Telefon'}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isEn ? 'Phone (optional)' : 'Telefon (valgfritt)'}
            className="w-full bg-transparent border-b border-black pb-2 text-[1rem] text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none transition-colors"
          />
        </div>
      </div>

      {/* Melding */}
      <div>
        <textarea
          id="contact-message"
          aria-label={isEn ? 'About the project' : 'Om prosjektet'}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isEn
              ? 'About the project (description, thoughts or timeframe)'
              : 'Om prosjektet (beskrivelse, tanker eller tidsramme)'
          }
          className="w-full bg-transparent border-b border-black pb-2 text-[1rem] text-black placeholder:text-neutral-400 focus:outline-none focus:border-black rounded-none resize-y transition-colors leading-(--line-height)"
        />
      </div>

      {/* Feilmelding */}
      {errorMessage && (
        <p className="text-black text-[0.95rem] border-l-2 border-black pl-3 py-1">
          {errorMessage}
        </p>
      )}

      {/* Privacy note & Send-knapp */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <p className="text-[0.875rem] text-black/60 leading-normal">
          {isEn ? (
            <>
              By submitting, you agree to our{' '}
              <Link href="/imprint-and-privacy-policy" prefetch={true} className="underline underline-offset-2 text-black hover:opacity-70 transition-opacity">
                privacy policy
              </Link>
              .
            </>
          ) : (
            <>
              Ved å sende inn godtar du vår{' '}
              <Link href="/imprint-and-privacy-policy" prefetch={true} className="underline underline-offset-2 text-black hover:opacity-70 transition-opacity">
                personvernerklæring
              </Link>
              .
            </>
          )}
        </p>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="border border-black px-6 py-2.5 text-[1rem] text-black bg-transparent hover:bg-black hover:text-white transition-colors cursor-pointer rounded-none disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
        >
          {status === 'submitting'
            ? (isEn ? 'Sending...' : 'Sender...')
            : (isEn ? 'Send inquiry' : 'Send henvendelse')}
        </button>
      </div>
    </form>
  );
}
