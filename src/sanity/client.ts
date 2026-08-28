import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false, // Sikrer at SSG henter ferske data ved byggetid
});

// Spørring for forsiden (kun siteSettings med hero og utvalgt innhold)
export const getFrontpageQuery = `
*[_type == "siteSettings"][0] {
  ...,
  "heroImageUrl": heroImage.asset->url,
  landingCarousel[]->{
    _id,
    title,
    "slug": slug.current,
    "image": coalesce(coverImage.asset->url, image.asset->url)
  },
  featuredContent[]->{
    _id,
    _type,
    title,
    date,
    summary,
    link,
    "slug": slug.current,
    "image": coalesce(
      coverImage.asset->{
        url,
        "aspectRatio": metadata.dimensions.aspectRatio
      },
      image.asset->{
        url,
        "aspectRatio": metadata.dimensions.aspectRatio
      }
    ),
    "videoUrl": autoplayVideo.asset->url,
    body,
    gallery[] {
      "url": asset->url,
      alt
    },
    startYear,
    completionYear,
    buildYear,
    location,
    type,
    use,
    status,
    client,
    contractor,
    size
  }
}
`;

// Spørring for alle prosjekter
export const getProjectsQuery = `
*[_type == "project" && hideFromOverview != true] | order(coalesce(completionYear, startYear, buildYear) desc) {
  _id,
  title,
  "slug": slug.current,
  startYear,
  completionYear,
  buildYear,
  type,
  use,
  tags,
  status,
  location,
  client,
  contractor,
  photographer,
  size,
  "coverImage": coverImage.asset->url,
  "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
  "coverImageAlt": coverImage.alt,
  gallery[] {
    "url": asset->url,
    alt
  },
  body
}
`;

// Spørring for et enkelt prosjekt basert på slug
export const getProjectBySlugQuery = `
*[_type == "project" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  title,
  "slug": slug.current,
  startYear,
  completionYear,
  buildYear,
  type,
  use,
  tags,
  status,
  location,
  client,
  contractor,
  photographer,
  size,
  "coverImage": coverImage.asset->url,
  "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
  "coverImageAlt": coverImage.alt,
  gallery[] {
    "url": asset->url,
    alt,
    caption,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  },
  contentBlocks[] {
    _type,
    _key,
    text,
    caption,
    size,
    "image": image.asset->url,
    "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
    "videoUrl": video.asset->url,
    title,
    images[] {
      "url": asset->url,
      alt,
      caption,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }
}
`;

// Spørring for oppsummering av alle prosjekter (for relaterte prosjekter nederst)
export const getAllProjectsSummaryQuery = `
*[_type == "project" && hideFromOverview != true] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  use,
  type,
  "coverImage": coverImage.asset->url,
  "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio
}
`;

// Spørring for nyheter
export const getNewsQuery = `
*[_type == "news"] | order(date desc) {
  _id,
  title,
  summary,
  date,
  link,
  "image": image.asset->url,
  "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio
}
`;

// Spørring for Studio-siden
export const getStudioQuery = `
*[_type == "studio"][0] {
  studioName,
  address,
  contactEmail,
  contactPhone,
  instagram,
  introText,
  bio,
  team[] {
    name,
    title,
    "image": image.asset->url
  },
  teamPastAndPresent,
  collaborators,
  showroomImages[] {
    "url": asset->url,
    alt
  },
  applicationsText,
  contentBlocks[] {
    _key,
    _type,
    text,
    title,
    size,
    caption,
    "image": image.asset->url,
    "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
    "videoUrl": video.asset->url,
    images[] {
      "url": asset->url,
      caption,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    },
    members[] {
      name,
      title,
      "image": image.asset->url
    },
    items,
    studioName,
    address,
    email,
    phone,
    instagram
  }
}
`;

// Spørring for Applications-siden
export const getApplicationsQuery = `
*[_type == "studio"][0] {
  "text": coalesce(applicationsText, *[_type == "applications"][0].text)
}
`;

// Spørring for Contact-siden (og global layout)
export const getSiteSettingsQuery = `
*[_type == "siteSettings"][0] {
  "heroImage": heroImage.asset->url,
  featuredContent[]->{
    _id,
    _type,
    title,
    "slug": slug.current,
    use,
    type,
    date,
    summary,
    "image": coalesce(coverImage.asset->url, image.asset->url)
  },
  "studioName": coalesce(*[_type == "studio"][0].studioName, studioName),
  "address": coalesce(*[_type == "studio"][0].address, address),
  "contactEmail": coalesce(*[_type == "studio"][0].contactEmail, contactEmail),
  "contactPhone": coalesce(*[_type == "studio"][0].contactPhone, contactPhone),
  "instagram": coalesce(*[_type == "studio"][0].instagram, instagram)
}
`;

// Spørring for Selected Works (Karusell på Work-siden)
export const getSelectedWorksQuery = `
*[_type == "siteSettings"][0] {
  selectedWorks[]->{
    _id,
    title,
    "slug": slug.current,
    startYear,
    completionYear,
    buildYear,
    "coverImage": coverImage.asset->url,
    "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio
  }
}
`;
