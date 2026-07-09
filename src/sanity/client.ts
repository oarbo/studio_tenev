import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false, // Sikrer at SSG henter ferske data ved byggetid
});

// Enkelt, omfattende GROQ-spørring for hele SPA-en
export const getAllDataQuery = `
{
  "projects": *[_type == "project"] | order(completionYear desc) {
    _id,
    title,
    "slug": slug.current,
    buildYear,
    status,
    location,
    client,
    contractor,
    photographer,
    size,
    "coverImage": coverImage.asset->url,
    "coverImageAlt": coverImage.alt,
    gallery[] {
      "url": asset->url,
      alt
    },
    body
  },
  "news": *[_type == "news"] | order(date desc) {
    _id,
    title,
    summary,
    date,
    link,
    "image": image.asset->url
  },
  "about": *[_type == "about"][0] {
    body
  },
  "people": *[_type == "people"][0] {
    bio,
    team,
    collaborators
  },
  "applications": *[_type == "applications"][0] {
    text
  },
  "siteSettings": *[_type == "siteSettings"][0] {
    ...,
    heroItem->{
      _type,
      _id,
      title,
      "slug": slug.current,
      "coverImage": coverImage.asset->url,
      "coverImageAlt": coverImage.alt
    }
  }
}
`;
