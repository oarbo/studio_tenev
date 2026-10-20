import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from './env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ferske data direkte fra Sanity API uten CDN-forsinkelse
});

// Spørring for forsiden (siteSettings med utvalgt innhold i gridet)
export const getFrontpageQuery = `
*[_type == "siteSettings"][0] {
  featuredContent[] {
    ...coalesce(item->, @->) {
      _id,
      _type,
      title,
      titleEn,
      "tag": coalesce(tag, category),
      date,
      summary,
      summaryEn,
      link,
      "slug": slug.current,
      startYear,
      completionYear,
      location,
      type,
      use,
      status,
      statusEn,
      client,
      contractor,
      size
    },
    "videoUrl": coalesce(
      overrideVideo.asset->url,
      item->landingVideo.asset->url,
      @->landingVideo.asset->url,
      item->autoplayVideo.asset->url,
      @->autoplayVideo.asset->url
    ),
    "image": select(
      defined(overrideImage.asset) => {
        "url": overrideImage.asset->url,
        "aspectRatio": overrideImage.asset->metadata.dimensions.aspectRatio,
        "lqip": overrideImage.asset->metadata.lqip,
        "hotspot": overrideImage.hotspot,
        "crop": overrideImage.crop
      },
      defined(coalesce(item->landingImage.asset, @->landingImage.asset)) => {
        "url": coalesce(item->landingImage.asset->url, @->landingImage.asset->url),
        "aspectRatio": coalesce(item->landingImage.asset->metadata.dimensions.aspectRatio, @->landingImage.asset->metadata.dimensions.aspectRatio),
        "lqip": coalesce(item->landingImage.asset->metadata.lqip, @->landingImage.asset->metadata.lqip),
        "hotspot": coalesce(item->landingImage.hotspot, @->landingImage.hotspot),
        "crop": coalesce(item->landingImage.crop, @->landingImage.crop)
      },
      defined(coalesce(item->coverImage.asset, @->coverImage.asset)) => {
        "url": coalesce(item->coverImage.asset->url, @->coverImage.asset->url),
        "aspectRatio": coalesce(item->coverImage.asset->metadata.dimensions.aspectRatio, @->coverImage.asset->metadata.dimensions.aspectRatio),
        "lqip": coalesce(item->coverImage.asset->metadata.lqip, @->coverImage.asset->metadata.lqip),
        "hotspot": coalesce(item->coverImage.hotspot, @->coverImage.hotspot),
        "crop": coalesce(item->coverImage.crop, @->coverImage.crop)
      },
      defined(coalesce(item->image.asset, @->image.asset)) => {
        "url": coalesce(item->image.asset->url, @->image.asset->url),
        "aspectRatio": coalesce(item->image.asset->metadata.dimensions.aspectRatio, @->image.asset->metadata.dimensions.aspectRatio),
        "lqip": coalesce(item->image.asset->metadata.lqip, @->image.asset->metadata.lqip),
        "hotspot": coalesce(item->image.hotspot, @->image.hotspot),
        "crop": coalesce(item->image.crop, @->image.crop)
      }
    )
  }
}
`;

// Spørring for alle prosjekter (Work-siden)
export const getProjectsQuery = `
*[_type == "project" && hideFromOverview != true] | order(coalesce(completionYear, startYear) desc) {
  _id,
  title,
  titleEn,
  "slug": slug.current,
  "showInCarousel": hideFromCarousel != true && showInCarousel != false,
  summary,
  summaryEn,
  "firstTextBlock": contentBlocks[_type == "textBlock" && defined(text)][0].text,
  "firstTextBlockEn": contentBlocks[_type == "textBlock" && defined(textEn)][0].textEn,
  body,
  "hasProjectPage": defined(coverImage.asset) || count(contentBlocks) > 0 || count(gallery) > 0,
  category,
  startYear,
  completionYear,
  type,
  use,
  status,
  statusEn,
  location,
  client,
  contractor,
  photographer,
  size,
  "coverImage": coalesce(coverImage.asset->url, carouselMedia[_type == "image"][0].asset->url, carouselMedia[defined(asset)][0].asset->url, carouselMedia[_type == "carouselVideo"][0].poster.asset->url, contentBlocks[_type == "carouselBlock"][0].items[defined(asset)][0].asset->url, contentBlocks[_type == "imageBlock"][0].image.asset->url, contentBlocks[_type == "columnsBlock"][0].columns[_type == "columnImage"][0].image.asset->url),
  "coverImageLqip": coalesce(coverImage.asset->metadata.lqip, carouselMedia[_type == "image"][0].asset->metadata.lqip, carouselMedia[defined(asset)][0].asset->metadata.lqip, contentBlocks[_type == "carouselBlock"][0].items[defined(asset)][0].asset->metadata.lqip, contentBlocks[_type == "imageBlock"][0].image.asset->metadata.lqip, contentBlocks[_type == "columnsBlock"][0].columns[_type == "columnImage"][0].image.asset->metadata.lqip),
  "coverImageAspectRatio": coalesce(coverImage.asset->metadata.dimensions.aspectRatio, carouselMedia[_type == "image"][0].asset->metadata.dimensions.aspectRatio, carouselMedia[defined(asset)][0].asset->metadata.dimensions.aspectRatio, contentBlocks[_type == "carouselBlock"][0].items[defined(asset)][0].asset->metadata.dimensions.aspectRatio, contentBlocks[_type == "imageBlock"][0].image.asset->metadata.dimensions.aspectRatio, contentBlocks[_type == "columnsBlock"][0].columns[_type == "columnImage"][0].image.asset->metadata.dimensions.aspectRatio),
  "coverImageHotspot": coalesce(coverImage.hotspot, carouselMedia[_type == "image"][0].hotspot, carouselMedia[defined(asset)][0].hotspot, contentBlocks[_type == "carouselBlock"][0].items[defined(asset)][0].hotspot, contentBlocks[_type == "imageBlock"][0].image.hotspot, contentBlocks[_type == "columnsBlock"][0].columns[_type == "columnImage"][0].image.hotspot),
  "coverImageAlt": coalesce(coverImage.alt, carouselMedia[_type == "image"][0].alt, carouselMedia[defined(asset)][0].alt, contentBlocks[_type == "carouselBlock"][0].items[defined(asset)][0].alt, contentBlocks[_type == "imageBlock"][0].image.alt, contentBlocks[_type == "columnsBlock"][0].columns[_type == "columnImage"][0].image.caption)
}
`;

// Spørring for et enkelt prosjekt basert på slug
export const getProjectBySlugQuery = `
*[_type == "project" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  title,
  titleEn,
  "slug": slug.current,
  summary,
  summaryEn,
  category,
  startYear,
  completionYear,
  type,
  use,
  status,
  statusEn,
  location,
  client,
  contractor,
  photographer,
  size,
  heroTextColor,
  carouselMedia[] {
    _type,
    _key,
    defined(asset) => {
      "type": "image",
      "url": asset->url,
      alt,
      caption,
      "aspectRatio": asset->metadata.dimensions.aspectRatio,
      "lqip": asset->metadata.lqip,
      hotspot,
      "filename": asset->originalFilename
    },
    _type == "carouselVideo" => {
      "type": "video",
      "videoUrl": video.asset->url,
      "posterUrl": poster.asset->url,
      "aspectRatio": coalesce(aspectRatio, poster.asset->metadata.dimensions.aspectRatio, 1.777),
      "lqip": poster.asset->metadata.lqip,
      alt,
      "filename": video.asset->originalFilename
    }
  },
  "coverImage": coverImage.asset->url,
  "coverImageLqip": coverImage.asset->metadata.lqip,
  "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
  "coverImageHotspot": coverImage.hotspot,
  "coverImageAlt": coverImage.alt,
  "coverImageFilename": coverImage.asset->originalFilename,
  gallery[] {
    "url": asset->url,
    alt,
    caption,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip,
    hotspot,
    "filename": asset->originalFilename
  },
  body,
  contentBlocks[] {
    _type,
    _key,
    disabled,
    text,
    textEn,
    caption,
    captionEn,
    size,
    isDrawings,
    items[] {
      _type,
      _key,
      defined(asset) => {
        "type": "image",
        "url": asset->url,
        alt,
        caption,
        "aspectRatio": asset->metadata.dimensions.aspectRatio,
        "lqip": asset->metadata.lqip,
        hotspot,
        "filename": asset->originalFilename
      },
      _type == "carouselVideo" => {
        "type": "video",
        "videoUrl": video.asset->url,
        "posterUrl": poster.asset->url,
        "aspectRatio": coalesce(aspectRatio, poster.asset->metadata.dimensions.aspectRatio, 1.777),
        "lqip": poster.asset->metadata.lqip,
        alt,
        "filename": video.asset->originalFilename
      }
    },
    "image": image.asset->url,
    "imageFilename": image.asset->originalFilename,
    "imageLqip": image.asset->metadata.lqip,
    "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
    "imageHotspot": image.hotspot,
    "videoUrl": video.asset->url,
    title,
    titleEn,
    images[] {
      "url": asset->url,
      alt,
      caption,
      "aspectRatio": asset->metadata.dimensions.aspectRatio,
      "lqip": asset->metadata.lqip,
      hotspot,
      "filename": asset->originalFilename
    },
    columnsCount,
    verticalAlign,
    columns[] {
      _type,
      _key,
      title,
      titleEn,
      text,
      textEn,
      caption,
      captionEn,
      aspectRatio,
      "image": image.asset->url,
      "imageFilename": image.asset->originalFilename,
      "imageLqip": image.asset->metadata.lqip,
      "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
      "imageHotspot": image.hotspot,
      "videoUrl": video.asset->url
    }
  }
}
`;

// Spørring for oppsummering av alle prosjekter (for relaterte prosjekter nederst)
export const getAllProjectsSummaryQuery = `
*[_type == "project" && hideFromOverview != true && defined(coverImage.asset)] | order(_createdAt desc) {
  _id,
  title,
  titleEn,
  "slug": slug.current,
  use,
  type,
  "coverImage": coverImage.asset->url,
  "coverImageLqip": coverImage.asset->metadata.lqip,
  "coverImageAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
  "coverImageHotspot": coverImage.hotspot
}
`;

// Spørring for alle prosjekt-slugs (for umiddelbar statisk forhåndsgenerering og prefetching)
export const getAllProjectSlugsQuery = `
*[_type == "project" && defined(slug.current)] {
  "slug": slug.current
}
`;

// Spørring for nyheter
export const getNewsQuery = `
*[_type == "news"] | order(date desc) {
  _id,
  title,
  titleEn,
  "tag": coalesce(tag, category),
  category,
  source,
  medium,
  project,
  summary,
  summaryEn,
  date,
  link,
  "image": image.asset->url,
  "imageLqip": image.asset->metadata.lqip,
  "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
  "imageHotspot": image.hotspot
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
  team[] {
    name
  },
  showroomImages[] {
    "url": asset->url,
    alt,
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip,
    hotspot
  },
  applicationsText,
  applicationsTextEn,
  contentBlocks[] {
    _key,
    _type,
    text,
    textEn,
    title,
    titleEn,
    size,
    caption,
    captionEn,
    "image": image.asset->url,
    "imageLqip": image.asset->metadata.lqip,
    "imageAspectRatio": image.asset->metadata.dimensions.aspectRatio,
    "imageHotspot": image.hotspot,
    "videoUrl": video.asset->url,
    images[] {
      "url": asset->url,
      caption,
      "aspectRatio": asset->metadata.dimensions.aspectRatio,
      "lqip": asset->metadata.lqip,
      hotspot
    },
    members[] {
      name
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
  "text": applicationsText
}
`;

// Spørring for fotografer og visualiseringer fra prosjekter til Imprint & Credits
export const getProjectCreditsQuery = `
*[_type == "project" && defined(photographer) && photographer != ""] | order(title asc) {
  _id,
  title,
  titleEn,
  "slug": slug.current,
  photographer
}
`;

// Spørring for Global Kontaktinformasjon & Site Settings
export const getSiteSettingsQuery = `
*[_type == "siteSettings"][0] {
  showGridOverlay,
  "studioName": coalesce(*[_type == "studio"][0].studioName, studioName),
  "address": coalesce(*[_type == "studio"][0].address, address),
  "contactEmail": coalesce(*[_type == "studio"][0].contactEmail, contactEmail),
  "contactPhone": coalesce(*[_type == "studio"][0].contactPhone, contactPhone),
  "instagram": coalesce(*[_type == "studio"][0].instagram, instagram)
}
`;
