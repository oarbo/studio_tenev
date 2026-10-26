'use client';

import React, { useState } from 'react';
import ContactForm from '@/components/ContactForm';
import { useLanguage } from '@/i18n/LanguageContext';

export default function KontaktContent() {
  const { locale } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isEn = locale === 'en';

  return (
    <div className="w-full px-side-padding pt-content-top mb-42">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
        <div className="md:col-start-3 md:col-span-8">
          <div className="text-measure flex flex-col text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
            {isSubmitted ? (
              <div className="flex flex-col">
                <h1 className="font-normal mb-4 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                  {isEn ? 'Thank you for reaching out' : 'Takk for din henvendelse'}
                </h1>
                <p className="mb-6">
                  {isEn
                    ? 'We have received your message and will get back to you as soon as possible to discuss your project.'
                    : 'Vi har mottatt meldingen din og vil ta kontakt så snart som mulig for å diskutere prosjektet.'}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-black underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer text-[1.125rem] md:text-[1.2rem]"
                  >
                    {isEn ? 'Send another inquiry →' : 'Send en ny henvendelse →'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-normal mb-4 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                  {isEn ? 'Contact' : 'Kontakt'}
                </h1>

                <div className="flex flex-col gap-4 mb-8 md:mb-12">
                  <p>
                    {isEn
                      ? 'Tell us about your plans – we are happy to arrange a site visit or invite you to our office to explore the possibilities for your project.'
                      : 'Fortell oss om planene dine – vi kommer gjerne på en uforpliktende befaring eller inviterer til et møte på kontoret for å se på mulighetene for ditt prosjekt.'}
                  </p>
                </div>

                {/* Henvendelsesskjema */}
                <ContactForm onSuccess={() => setIsSubmitted(true)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
