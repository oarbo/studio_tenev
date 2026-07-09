import React from 'react';
import Layout from '@/components/Layout';
import IndexSection from '@/components/IndexSection';
import ProjectsOverview from '@/components/ProjectsOverview';
import NewsSection from '@/components/NewsSection';
import AboutSection from '@/components/AboutSection';
import PeopleSection from '@/components/PeopleSection';
import ContactSection from '@/components/ContactSection';
import BackToTop from '@/components/BackToTop';
import SanityImage from '@/components/SanityImage';
import { client, getAllDataQuery } from '@/sanity/client';
import { mockData } from '@/sanity/mockData';

export const revalidate = 60; 

export default async function Page() {
  let data;
  
  // Sjekker om API-nøkkel mangler, slik at testmodus aktiveres
  const useMock = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your_project_id_here';

  if (useMock) {
    console.log("Benytter mockData.ts fordi Sanity Project ID mangler.");
    data = mockData;
  } else {
    data = await client.fetch(getAllDataQuery).catch(() => mockData);
  }

  const { projects = [], news = [], about, people, applications, siteSettings } = data || {};
  
  const heroItem = siteSettings?.heroItem;
  const remainingProjects = heroItem ? projects.filter((p: { _id: string }) => p._id !== heroItem._id) : projects;

  return (
    <Layout>
      {/* Bleed Hero-bilde */}
      {heroItem && (
        <div className="absolute top-0 left-0 right-0 z-10 h-[90vh] pointer-events-none">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-fm px-side-padding h-full">
            <div className="col-span-4 md:col-start-3 md:col-span-6 relative h-full w-[calc(100%+6.25rem)] max-w-none pointer-events-auto">
              {heroItem.coverImage && (
                <SanityImage
                  src={heroItem.coverImage}
                  alt={heroItem.coverImageAlt || heroItem.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 75vw"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for å dytte ned det andre innholdet under den absolutte Hero-en */}
      {heroItem && <div className="h-[90vh] w-full pointer-events-none" />}

      <IndexSection id="selected-projects" title="Selected projects">
        <ProjectsOverview projects={remainingProjects} />
      </IndexSection>

      <IndexSection id="about" title="About">
        <AboutSection body={about?.body} />
      </IndexSection>
      
      <IndexSection id="people" title="People">
        <PeopleSection people={people} />
      </IndexSection>
      
      <IndexSection id="news" title="News" fullWidth>
        <NewsSection news={news} />
      </IndexSection>

      <IndexSection id="applications" title="Applications">
        {applications?.text && (
          <p className="m-0 text-black leading-[37px] break-all whitespace-pre-line">
            {applications.text}
          </p>
        )}
      </IndexSection>
      
      <IndexSection id="contact" title="Contact">
        <ContactSection settings={siteSettings} />
      </IndexSection>

      <BackToTop />
    </Layout>
  );
}
