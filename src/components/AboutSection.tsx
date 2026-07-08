import React from 'react';
import { GridSection } from './Layout';
import { PortableText } from '@portabletext/react';

interface AboutSectionProps {
  body: any[];
}

export default function AboutSection({ body }: AboutSectionProps) {
  // Egendefinerte PortableText-komponenter som respekterer --fm for avstander
  const components = {
    block: {
      normal: ({ children }: any) => <p className="mb-fm-1 last:mb-0">{children}</p>,
      h1: ({ children }: any) => <h1 className="mb-fm-1 mt-fm-2 font-medium">{children}</h1>,
      h2: ({ children }: any) => <h2 className="mb-fm-1 mt-fm-2 font-medium">{children}</h2>,
      h3: ({ children }: any) => <h3 className="mb-fm-1 mt-fm-2 font-medium">{children}</h3>,
      h4: ({ children }: any) => <h4 className="mb-fm-1 mt-fm-2 font-medium">{children}</h4>,
      blockquote: ({ children }: any) => <blockquote className="border-l border-black pl-fm-1 mb-fm-1">{children}</blockquote>,
    },
    list: {
      bullet: ({ children }: any) => <ul className="list-disc list-inside mb-fm-1">{children}</ul>,
      number: ({ children }: any) => <ol className="list-decimal list-inside mb-fm-1">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }: any) => <li className="mb-0">{children}</li>,
      number: ({ children }: any) => <li className="mb-0">{children}</li>,
    },
  };

  return (
    <GridSection id="about">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500">About</h2>
      <div className="text-lg leading-relaxed mb-fm-4">
        {body ? (
          <PortableText value={body} components={components} />
        ) : (
          <p className="mb-fm-1">Informasjon om arkitektkontoret mangler.</p>
        )}
      </div>
    </GridSection>
  );
}
