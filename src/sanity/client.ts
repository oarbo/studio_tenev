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
    completionYear,
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
    date,
    link,
    "image": image.asset->url
  },
  "about": *[_type == "about"][0] {
    body
  },
  "people": *[_type == "person"] | order(name asc) {
    _id,
    name,
    role
  }
}
`;
