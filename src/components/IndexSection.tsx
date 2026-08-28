import React, { ReactNode } from 'react';

interface IndexSectionProps {
  id: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function IndexSection({ id, children, fullWidth }: IndexSectionProps) {
  return (
    <section id={id} className="w-full px-side-padding mb-37 last-of-type:mb-fm-4 min-w-0">
      {fullWidth ? children : (
        <div className="max-w-256.25">
          {children}
        </div>
      )}
    </section>
  );
}
