import React from 'react';
import Layout from '@/components/Layout';
import HomeGrid from '@/components/HomeGrid';
import { client, getFrontpageQuery } from '@/sanity/client';

export const revalidate = 60; 

export default async function Page() {
  const data = await client.fetch(getFrontpageQuery).catch(() => null);
  const siteSettings = data || {};
  
  const featuredContent = siteSettings?.featuredContent || [];

  return (
    <Layout>
      <div id="home-container" className="w-full">
        <h1 className="sr-only">Studio Tenev — Arkitekt Bergen</h1>
        {featuredContent.length > 0 && (
          <div id="main-content">
            <HomeGrid items={featuredContent} />
          </div>
        )}
      </div>
    </Layout>
  );
}
