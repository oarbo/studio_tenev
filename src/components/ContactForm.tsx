'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps = {}) {
  const { locale } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  // Honeypot for spam bots
  const [botField, setBotField] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const isEn = locale === 'en';

  const isFirstNameFloating = Boolean(firstName);
  const isLastNameFloating = Boolean(lastName);
  const isEmailFloating = Boolean(email);
  const isPhoneFloating = Boolean(phone);
  const isMessageFloating = Boolean(message);

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
    const input = e.currentTarget;
    if (!phone.trim()) {
      setPhone('+47 ');
      requestAnimationFrame(() => {
        input.setSelectionRange(4, 4);
      });
    } else {
      requestAnimationFrame(() => {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      });
    }
  };

  const handlePhoneBlur = () => {
    if (phone.trim() === '+47' || phone.trim() === '+') {
      setPhone('');
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (botField) {
      // Bot detected, silently fake success
      setStatus('success');
      onSuccess?.();
      return;
    }

    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      message?: string;
    } = {};

    if (!firstName.trim()) {
      errors.firstName = isEn ? 'Enter your first name' : 'Oppgi fornavn';
    }

    if (!lastName.trim()) {
      errors.lastName = isEn ? 'Enter your last name' : 'Oppgi etternavn';
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!trimmedEmail) {
      errors.email = isEn ? 'Enter your email address' : 'Oppgi e-postadresse';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = isEn ? 'Enter a valid email address' : 'Oppgi en gyldig e-postadresse';
    }

    const trimmedPhone = phone.trim();
    const isPhoneEmpty = !trimmedPhone || trimmedPhone === '+47' || trimmedPhone === '+';
    if (isPhoneEmpty) {
      errors.phone = isEn ? 'Enter a valid mobile phone number' : 'Oppgi et gyldig mobilnummer';
    } else {
      const digits = trimmedPhone.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) {
        errors.phone = isEn ? 'Enter a valid mobile phone number' : 'Oppgi et gyldig mobilnummer';
      }
    }

    if (!message.trim()) {
      errors.message = isEn ? 'Please describe your project' : 'Beskriv prosjektet';
    }

    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus('submitting');
    setErrorMessage('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: trimmedEmail,
          phone: isPhoneEmpty ? '' : trimmedPhone,
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
          ? 'Sorry, an error occurred while sending. Please contact us directly at hello@studiotenev.com.'
          : 'Beklager, det oppstod en feil under sending. Vennligst send oss en e-post direkte til hello@studiotenev.com.'
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
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setMessage('');
            setFieldErrors({});
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
    <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-y-[var(--fm-half)]">
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

      {/* Fornavn og Etternavn (2 kolonner på desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-[var(--fm-half)]">
        <div className="relative">
          <div className={`relative pt-5 pb-1 border-b ${fieldErrors.firstName ? 'border-red-600' : 'border-black'}`}>
            <label
              htmlFor="contact-firstname"
              className={`pointer-events-none absolute left-0 select-none transition-[top,font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isFirstNameFloating
                  ? 'top-[6px] text-[13px] font-normal'
                  : 'top-5 text-[1.125rem] md:text-[1.2rem] font-normal'
              } ${fieldErrors.firstName ? 'text-red-600' : 'text-black'}`}
            >
              {isEn ? 'First name' : 'Fornavn'}
            </label>
            <input
              id="contact-firstname"
              type="text"
              autoComplete="given-name"
              value={firstName}
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'error-firstname' : undefined}
              onFocus={() => {
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              className={`w-full bg-transparent pb-1 text-[1.125rem] md:text-[1.2rem] focus:outline-none focus-visible:ring-1 focus-visible:ring-black md:focus-visible:ring-0 md:focus:ring-0 md:outline-none rounded-none ${
                fieldErrors.firstName ? 'text-red-600' : 'text-black'
              }`}
            />
          </div>
          {fieldErrors.firstName && (
            <p id="error-firstname" className="absolute left-0 top-full pt-1 text-[13px] text-red-600 leading-tight pointer-events-none">
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        <div className="relative">
          <div className={`relative pt-5 pb-1 border-b ${fieldErrors.lastName ? 'border-red-600' : 'border-black'}`}>
            <label
              htmlFor="contact-lastname"
              className={`pointer-events-none absolute left-0 select-none transition-[top,font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isLastNameFloating
                  ? 'top-[6px] text-[13px] font-normal'
                  : 'top-5 text-[1.125rem] md:text-[1.2rem] font-normal'
              } ${fieldErrors.lastName ? 'text-red-600' : 'text-black'}`}
            >
              {isEn ? 'Last name' : 'Etternavn'}
            </label>
            <input
              id="contact-lastname"
              type="text"
              autoComplete="family-name"
              value={lastName}
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'error-lastname' : undefined}
              onFocus={() => {
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              className={`w-full bg-transparent pb-1 text-[1.125rem] md:text-[1.2rem] focus:outline-none focus-visible:ring-1 focus-visible:ring-black md:focus-visible:ring-0 md:focus:ring-0 md:outline-none rounded-none ${
                fieldErrors.lastName ? 'text-red-600' : 'text-black'
              }`}
            />
          </div>
          {fieldErrors.lastName && (
            <p id="error-lastname" className="absolute left-0 top-full pt-1 text-[13px] text-red-600 leading-tight pointer-events-none">
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* E-post og Telefon (2 kolonner på desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-[var(--fm-half)]">
        <div className="relative">
          <div className={`relative pt-5 pb-1 border-b ${fieldErrors.email ? 'border-red-600' : 'border-black'}`}>
            <label
              htmlFor="contact-email"
              className={`pointer-events-none absolute left-0 select-none transition-[top,font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isEmailFloating
                  ? 'top-[6px] text-[13px] font-normal'
                  : 'top-5 text-[1.125rem] md:text-[1.2rem] font-normal'
              } ${fieldErrors.email ? 'text-red-600' : 'text-black'}`}
            >
              {isEn ? 'Email' : 'E-post'}
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'error-email' : undefined}
              onFocus={() => {
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`w-full bg-transparent pb-1 text-[1.125rem] md:text-[1.2rem] focus:outline-none focus-visible:ring-1 focus-visible:ring-black md:focus-visible:ring-0 md:focus:ring-0 md:outline-none rounded-none ${
                fieldErrors.email ? 'text-red-600' : 'text-black'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p id="error-email" className="absolute left-0 top-full pt-1 text-[13px] text-red-600 leading-tight pointer-events-none">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="relative">
          <div className={`relative pt-5 pb-1 border-b ${fieldErrors.phone ? 'border-red-600' : 'border-black'}`}>
            <label
              htmlFor="contact-phone"
              className={`pointer-events-none absolute left-0 select-none transition-[top,font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isPhoneFloating
                  ? 'top-[6px] text-[13px] font-normal'
                  : 'top-5 text-[1.125rem] md:text-[1.2rem] font-normal'
              } ${fieldErrors.phone ? 'text-red-600' : 'text-black'}`}
            >
              {isEn ? 'Phone' : 'Telefon'}
            </label>
            <input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'error-phone' : undefined}
              onFocus={handlePhoneFocus}
              onBlur={handlePhoneBlur}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              className={`w-full bg-transparent pb-1 text-[1.125rem] md:text-[1.2rem] focus:outline-none focus-visible:ring-1 focus-visible:ring-black md:focus-visible:ring-0 md:focus:ring-0 md:outline-none rounded-none ${
                fieldErrors.phone ? 'text-red-600' : 'text-black'
              }`}
            />
          </div>
          {fieldErrors.phone && (
            <p id="error-phone" className="absolute left-0 top-full pt-1 text-[13px] text-red-600 leading-tight pointer-events-none">
              {fieldErrors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Melding */}
      <div className="relative">
        <div className={`relative pt-5 pb-1 border-b ${fieldErrors.message ? 'border-red-600' : 'border-black'}`}>
          <label
            htmlFor="contact-message"
            className={`pointer-events-none absolute left-0 select-none transition-[top,font-size] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMessageFloating
                ? 'top-[6px] text-[13px] font-normal'
                : 'top-5 text-[1.125rem] md:text-[1.2rem] font-normal'
            } ${fieldErrors.message ? 'text-red-600' : 'text-black'}`}
          >
            {isEn ? 'About the project' : 'Om prosjektet'}
          </label>
          <textarea
            ref={textareaRef}
            id="contact-message"
            rows={3}
            value={message}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? 'error-message' : undefined}
            onFocus={() => {
              if (fieldErrors.message) {
                setFieldErrors((prev) => ({ ...prev, message: undefined }));
              }
            }}
            onChange={(e) => {
              setMessage(e.target.value);
              if (fieldErrors.message) {
                setFieldErrors((prev) => ({ ...prev, message: undefined }));
              }
            }}
            className={`w-full bg-transparent pb-1 text-[1.125rem] md:text-[1.2rem] focus:outline-none focus-visible:ring-1 focus-visible:ring-black md:focus-visible:ring-0 md:focus:ring-0 md:outline-none rounded-none resize-none overflow-hidden leading-(--line-height) ${
              fieldErrors.message ? 'text-red-600' : 'text-black'
            }`}
          />
        </div>
        {fieldErrors.message && (
          <p id="error-message" className="absolute left-0 top-full pt-1 text-[13px] text-red-600 leading-tight pointer-events-none">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Generell feilmelding (kun ved server-/nettverksfeil) */}
      {errorMessage && (
        <p className="text-red-600 text-[0.95rem] border-l-2 border-red-600 pl-3 py-1">
          {errorMessage}
        </p>
      )}

      {/* Send-knapp & Personvernerklæring: Mobil er midtstilt stakket, Desktop er på samme linje med matchende baseline */}
      <div className="flex flex-col items-center text-center gap-3 pt-6 md:flex-row md:items-baseline md:justify-between md:text-left md:pt-4">
        <p className="order-2 md:order-1 text-[0.875rem] text-black leading-tight max-w-[28rem]">
          {isEn ? (
            <>
              By submitting, you agree to our{' '}
              <Link href="/imprint-and-privacy-policy" prefetch={true} className="underline underline-offset-2 decoration-1 text-black hover:opacity-70 transition-opacity">
                privacy policy
              </Link>
              .
            </>
          ) : (
            <>
              Ved å sende inn godtar du vår{' '}
              <Link href="/imprint-and-privacy-policy" prefetch={true} className="underline underline-offset-2 decoration-1 text-black hover:opacity-70 transition-opacity">
                personvernerklæring
              </Link>
              .
            </>
          )}
        </p>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="order-1 md:order-2 border border-black px-6 pt-[calc(0.625rem-3px)] pb-[calc(0.625rem+3px)] text-[1rem] text-black bg-transparent hover:bg-black hover:text-white transition-colors cursor-pointer rounded-none disabled:opacity-50 whitespace-nowrap self-center md:self-auto"
        >
          {status === 'submitting'
            ? (isEn ? 'Sending...' : 'Sender...')
            : (isEn ? 'Send inquiry' : 'Send henvendelse')}
        </button>
      </div>
    </form>
  );
}
