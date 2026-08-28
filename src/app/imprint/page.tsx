import React from 'react';
import Layout from '@/components/Layout';
import IndexSection from '@/components/IndexSection';
import { client, getSiteSettingsQuery } from '@/sanity/client';

export const revalidate = 60;

export default async function ImprintPage() {
  const siteSettings = await client.fetch(getSiteSettingsQuery).catch(() => null);

  return (
    <Layout>
      <IndexSection id="imprint">
        <div className="max-w-3xl prose prose-p:text-base prose-p:leading-[37px] prose-h2:font-normal prose-h2:text-[30px] prose-h2:mt-fm-2 text-black">
          <h2>Imprint</h2>
          <p>
            Studio Tenev<br />
            {siteSettings?.address && (
              <span className="whitespace-pre-wrap">{siteSettings.address}</span>
            )}
          </p>
          <p>
            {siteSettings?.contactEmail && (
              <>Email: {siteSettings.contactEmail}<br /></>
            )}
            {siteSettings?.contactPhone && (
              <>Phone: {siteSettings.contactPhone}</>
            )}
          </p>

          <h2>Privacy Policy</h2>
          <p>
            This website does not collect any personal data without your explicit consent. 
            If you sign up for our newsletter, your email address will be stored securely 
            and used solely for the purpose of sending you updates about Studio Tenev. 
            You can unsubscribe at any time.
          </p>
          <p>
            We use essential cookies to ensure the basic functionality of the website. 
            No third-party tracking cookies are used.
          </p>
        </div>
      </IndexSection>
    </Layout>
  );
}
