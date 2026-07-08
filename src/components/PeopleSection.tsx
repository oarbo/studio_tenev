import React from 'react';
import { GridSection } from './Layout';

interface Person {
  _id: string;
  name: string;
  role: string;
}

export default function PeopleSection({ people }: { people: Person[] }) {
  return (
    <GridSection id="people">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500 mt-fm-4">People</h2>
      {/* 2-kolonnes typografisk oppstilling for ansatte */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-fm-1 gap-x-fm-2 border-t border-black pt-fm-1">
        {people.map((person) => (
          <li key={person._id} className="flex flex-col mb-fm-1">
            <strong className="font-medium text-base">{person.name}</strong>
            <span className="text-gray-500">{person.role}</span>
          </li>
        ))}
        {people.length === 0 && <li className="text-gray-500">Ingen ansatte registrert.</li>}
      </ul>
    </GridSection>
  );
}
