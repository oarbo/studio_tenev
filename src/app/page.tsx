import React from 'react';
import Layout, { GridSection } from '@/components/Layout';
import ProjectsOverview from '@/components/ProjectsOverview';
import { client, getAllDataQuery } from '@/sanity/client';

// Sikrer at siden forhåndsgenereres (SSG) og eventuelt re-valideres
export const revalidate = 60; 

export default async function Page() {
  // Henter alle data i én enkelt GROQ-operasjon
  const data = await client.fetch(getAllDataQuery);
  const { projects = [], news = [], about, people = [] } = data || {};

  return (
    <Layout>
      {/* 1. Prosjektoversikt */}
      <GridSection id="selected-projects" fullWidth>
        <ProjectsOverview projects={projects} />
      </GridSection>

      {/* 2. Om kontoret */}
      <GridSection id="about">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500">About</h2>
        <div className="prose text-lg leading-relaxed mb-fm-4">
          {about?.body ? (
            <p>Her kommer innholdet fra Portable Text-blokken for "About".</p>
          ) : (
            <p>Informasjon om arkitektkontoret kommer her.</p>
          )}
        </div>
      </GridSection>

      {/* 3. Nyheter */}
      <GridSection id="news">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500">News</h2>
        <ul className="flex flex-col border-t border-black">
          {news.map((item: any) => (
            <li key={item._id} className="py-fm-1 border-b border-gray-300 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-fm-2">
              <span className="text-gray-500 tabular-nums min-w-[100px]">
                {new Date(item.date).toLocaleDateString('no-NO')}
              </span>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
            </li>
          ))}
          {news.length === 0 && <li className="py-fm-1 text-gray-500">Ingen nyheter tilgjengelig.</li>}
        </ul>
      </GridSection>

      {/* 4. Ansatte (People) */}
      <GridSection id="people">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500 mt-fm-4">People</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
          {people.map((person: any) => (
            <li key={person._id} className="flex flex-col">
              <strong className="font-medium">{person.name}</strong>
              <span className="text-gray-500 text-sm">{person.role}</span>
            </li>
          ))}
          {people.length === 0 && <li className="text-gray-500">Ingen ansatte registrert.</li>}
        </ul>
      </GridSection>
      
      {/* Kontakt (valgfritt) */}
      <GridSection id="contact">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500 mt-fm-4">Contact</h2>
        <p className="text-lg">hello@arkitektkontor.no</p>
      </GridSection>

    </Layout>
  );
}
