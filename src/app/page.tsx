import React from 'react';
import Layout from '@/components/Layout';
import HomeGrid from '@/components/HomeGrid';
import HeroLanding from '@/components/HeroLanding';
import { client, getFrontpageQuery } from '@/sanity/client';

export const revalidate = 60; 

export default async function Page() {
  const data = await client.fetch(getFrontpageQuery).catch(() => null);
  const siteSettings = data || {};
  
  const featuredContent = siteSettings?.featuredContent || [];

  return (
    <Layout noPadding>
      <div id="home-container" className="w-full">
        <HeroLanding 
          carousel={siteSettings.landingCarousel} 
          fallbackImageUrl={siteSettings.heroImageUrl} 
        />
        
        {featuredContent.length > 0 && (
          <div id="main-content" className="pt-fm-4">
            <HomeGrid items={featuredContent} />
          </div>
        )}
      </div>
    </Layout>
  );
}
