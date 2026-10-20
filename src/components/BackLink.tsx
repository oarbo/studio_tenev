'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackLinkProps {
  label: string;
  fallbackHref: string;
  className?: string;
}

export default function BackLink({ label, fallbackHref, className = '' }: BackLinkProps) {
  const router = useRouter();

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleBack();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, fallbackHref]);

  return (
    <div className={`!indent-0 ${className}`}>
      <Link
        href={fallbackHref}
        onClick={handleClick}
        className="inline-block text-black text-[1rem] hover:underline underline-offset-4 decoration-1 transition-opacity cursor-pointer !indent-0"
        aria-label={`Gå tilbake til ${label}`}
      >
        &larr; {label}
      </Link>
    </div>
  );
}
