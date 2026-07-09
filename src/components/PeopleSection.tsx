import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface PeopleData {
  bio?: PortableTextBlock[];
  team?: string[];
  collaborators?: string[];
}

export default function PeopleSection({ people }: { people?: PeopleData }) {
  if (!people) return null;

  return (
    <div className="flex flex-col text-black min-w-0">
      {people.bio && (
        <div className="w-full max-w-[1025px] leading-[37px] break-all whitespace-pre-line [&>p]:m-0">
          <PortableText value={people.bio} />
        </div>
      )}

      {/* Spacer mellom bio og lister (2 blanklinjer = 74px) */}
      {(people.team || people.collaborators) && (
        <div className="h-[74px] w-full" aria-hidden="true" />
      )}

      {/* Lister for Team og Collaborators */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-fm min-w-0">
        {/* Team kolonne (global kolonne 3 og 4) */}
        <div className="flex flex-col min-w-0 md:col-span-2">
          <h3 className="m-0 leading-[37px]">Team past and present</h3>
          {/* Spacer under tittel (1 blanklinje = 37px) */}
          <div className="h-[37px] w-full" aria-hidden="true" />
          {people.team?.map((name, index) => (
            <span key={index} className="block leading-[37px] break-all">{name}</span>
          ))}
        </div>

        {/* Collaborators kolonne (global kolonne 5, 6, 7, 8) */}
        <div className="flex flex-col min-w-0 md:col-start-3 md:col-span-4">
          <h3 className="m-0 leading-[37px]">Collaborators</h3>
          {/* Spacer under tittel (1 blanklinje = 37px) */}
          <div className="h-[37px] w-full" aria-hidden="true" />
          {people.collaborators?.map((name, index) => (
            <span key={index} className="block leading-[37px] break-all">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
