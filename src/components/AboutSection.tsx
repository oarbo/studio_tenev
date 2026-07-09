import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface AboutSectionProps {
  body: PortableTextBlock[];
}

export default function AboutSection({ body }: AboutSectionProps) {
  // Egendefinerte PortableText-komponenter som respekterer --fm for avstander
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className="mb-fm-1 last:mb-0">{children}</p>,
      h1: ({ children }) => <h1 className="mb-fm-1 mt-fm-2 font-medium">{children}</h1>,
      h2: ({ children }) => <h2 className="mb-fm-1 mt-fm-2 font-medium">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-fm-1 mt-fm-2 font-medium">{children}</h3>,
      h4: ({ children }) => <h4 className="mb-fm-1 mt-fm-2 font-medium">{children}</h4>,
      blockquote: ({ children }) => <blockquote className="border-l border-black pl-fm-1 mb-fm-1">{children}</blockquote>,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc list-inside mb-fm-1">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal list-inside mb-fm-1">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="mb-0">{children}</li>,
      number: ({ children }) => <li className="mb-0">{children}</li>,
    },
  };

  return (
    <div className="mb-fm-4 max-w-[1025px]">
      {body ? (
        <PortableText value={body} components={components} />
      ) : (
        <p className="mb-fm-1">Informasjon om arkitektkontoret mangler.</p>
      )}
    </div>
  );
}
