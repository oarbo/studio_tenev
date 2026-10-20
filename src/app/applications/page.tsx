import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getApplicationsQuery } from '@/sanity/client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Applications — Studio Tenev',
  alternates: {
    canonical: '/applications',
  },
};

export default async function ApplicationsPage() {
  const applications = await client.fetch(getApplicationsQuery).catch(() => null);

  return (
    <Layout noPadding>
      <div className="w-full px-side-padding pt-content-top mb-42">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
          <div className="md:col-start-3 md:col-span-8">
            <div className="text-measure text-black text-[1rem]">
              <h1 className="font-normal mb-4">Applications</h1>
              {applications?.text ? (
                <p className="whitespace-pre-wrap">{applications.text}</p>
              ) : (
                <p>
                  We appreciate applications from talented architects and interns. Please send your
                  portfolio and CV to{' '}
                  <a href="mailto:hello@studiotenev.com" className="underline underline-offset-4 hover:opacity-70">
                    hello@studiotenev.com
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
