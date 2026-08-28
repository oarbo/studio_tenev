import React from 'react';
import Layout from '@/components/Layout';
import IndexSection from '@/components/IndexSection';
import { client, getApplicationsQuery } from '@/sanity/client';

export const revalidate = 60;

export default async function ApplicationsPage() {
  const applications = await client.fetch(getApplicationsQuery).catch(() => null);

  return (
    <Layout>
      <IndexSection id="applications">
        {applications?.text && (
          <div className="max-w-3xl prose prose-p:text-2xl prose-p:leading-relaxed prose-a:text-black hover:prose-a:opacity-70">
            {applications.text}
          </div>
        )}
      </IndexSection>
    </Layout>
  );
}
