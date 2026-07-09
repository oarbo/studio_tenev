import React, { ReactNode } from 'react';

interface IndexSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function IndexSection({ id, title, children, fullWidth }: IndexSectionProps) {
  return (
    <section id={id} className="grid grid-cols-4 md:grid-cols-8 gap-fm px-side-padding mb-[148px] last-of-type:mb-fm-4 w-full min-w-0">
      <div className="col-span-4 md:col-start-3 md:col-span-6 min-w-0">
        <h2 className="h-[37px] leading-[37px] flex items-baseline capitalize text-black m-0">
          {title}
        </h2>
        {/* Spacer under tittel (1 blanklinje) */}
        <div className="h-[37px] w-full" aria-hidden="true" />
      </div>
      {fullWidth ? children : (
        <div className="col-span-4 md:col-start-3 md:col-span-6">
          {children}
        </div>
      )}
    </section>
  );
}
