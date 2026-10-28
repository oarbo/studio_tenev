export type Locale = 'no' | 'en';

export interface Translations {
  // Navigation
  work: string;
  studio: string;
  news: string;

  // Footer
  backToTop: string;
  information: string;
  privacyPolicy: string;
  address: string;
  contact: string;

  // Work & Projects
  name: string;
  type: string;
  size: string;
  year: string;
  status: string;
  location: string;
  client: string;
  contractor: string;
  photographer: string;
  rendering: string;
  images: string;
  country: string;
  use: string;
  goToProject: string;
  moreProjects: string;
  noProjectsFound: string;
  removeFilter: string;
  filterOn: string;
  viewAll: string;
  categoryResidential: string;
  categoryCommercial: string;
  categoryDestination: string;

  // Studio & Contact
  ourServices: string;
  bookConsultation: string;
  team: string;
  previousTeam: string;
  applications: string;

  // News
  readMore: string;
}

export type TranslationKeys = keyof Translations;

export const translations: Record<Locale, Translations> = {
  no: {
    work: 'Arbeid',
    studio: 'Studio',
    news: 'Nyheter',

    backToTop: 'Til toppen',
    information: 'Informasjon',
    privacyPolicy: 'Kolofon og personvern',
    address: 'Adresse',
    contact: 'Kontakt',

    name: 'Navn',
    type: 'Type',
    size: 'Størrelse',
    year: 'År',
    status: 'Status',
    location: 'Sted',
    client: 'Oppdragsgiver',
    contractor: 'Entreprenør',
    photographer: 'Fotograf',
    rendering: 'Rendring',
    images: 'Bilder',
    country: 'Land',
    use: 'Formål',
    goToProject: 'Gå til prosjekt',
    moreProjects: 'Flere prosjekter',
    noProjectsFound: 'Ingen prosjekter funnet med det valgte filteret.',
    removeFilter: 'Fjern filter',
    filterOn: 'Filtrer på',
    viewAll: 'Vis alle',
    categoryResidential: 'Bolig',
    categoryCommercial: 'Næring',
    categoryDestination: 'Destinasjonsutvikling',

    ourServices: 'Våre tjenester',
    bookConsultation: 'Bestill gratis befaring',
    team: 'Team',
    previousTeam: 'Tidligere team',
    applications: 'Søknader',

    readMore: 'Les mer',
  },
  en: {
    work: 'Work',
    studio: 'Studio',
    news: 'News',

    backToTop: 'Back to top',
    information: 'Information',
    privacyPolicy: 'Imprint and Privacy policy',
    address: 'Address',
    contact: 'Contact',

    name: 'Name',
    type: 'Type',
    size: 'Size',
    year: 'Year',
    status: 'Status',
    location: 'Location',
    client: 'Client',
    contractor: 'Contractor',
    photographer: 'Photographer',
    rendering: 'Rendering',
    images: 'Images',
    country: 'Country',
    use: 'Use',
    goToProject: 'Go to project',
    moreProjects: 'More projects',
    noProjectsFound: 'No projects found with the selected filter.',
    removeFilter: 'Remove filter',
    filterOn: 'Filter on',
    viewAll: 'All',
    categoryResidential: 'Residential',
    categoryCommercial: 'Commercial',
    categoryDestination: 'Destination development',

    ourServices: 'Our services',
    bookConsultation: 'Book a consultation',
    team: 'Team',
    previousTeam: 'Previous Team',
    applications: 'Applications',

    readMore: 'Read more',
  },
};

export const statusTranslations: Record<string, { no: string; en: string }> = {
  'Under utvikling': { no: 'Under utvikling', en: 'Under development' },
  'Under oppføring': { no: 'Under oppføring', en: 'Under construction' },
  'Ferdigstilt': { no: 'Ferdigstilt', en: 'Completed' },
  'Mulighetsstudie': { no: 'Mulighetsstudie', en: 'Feasibility study' },
  'Konsept': { no: 'Konsept', en: 'Concept' },
  'Skisseprosjekt': { no: 'Skisseprosjekt', en: 'Schematic design' },
  'Rammesøknad': { no: 'Rammesøknad', en: 'Planning application' },
  'Detaljprosjekt': { no: 'Detaljprosjekt', en: 'Detailed design' },
  'Pågående': { no: 'Pågående', en: 'Ongoing' },
};

export const tagTranslations: Record<string, { no: string; en: string }> = {
  'Bolig': { no: 'Bolig', en: 'Residential' },
  'Enebolig': { no: 'Enebolig', en: 'House' },
  'Fritidsbolig': { no: 'Fritidsbolig', en: 'Holiday home' },
  'Hytte': { no: 'Hytte', en: 'Cabin' },
  'Feriehus': { no: 'Feriehus', en: 'Holiday home' },
  'Sommerhus': { no: 'Sommerhus', en: 'Summer house' },
  'Leilighet': { no: 'Leilighet', en: 'Apartment' },
  'Flerbolig': { no: 'Flerbolig', en: 'Multi-family housing' },
  'Flermannsbolig': { no: 'Flermannsbolig', en: 'Multi-family housing' },
  'Tomannsbolig': { no: 'Tomannsbolig', en: 'Semi-detached house' },
  'Rekkehus': { no: 'Rekkehus', en: 'Townhouse' },
  'Naust': { no: 'Naust', en: 'Boathouse' },
  'Anneks': { no: 'Anneks', en: 'Annex' },
  'Garasje': { no: 'Garasje', en: 'Garage' },
  'Nybygg': { no: 'Nybygg', en: 'New build' },
  'Tilbygg': { no: 'Tilbygg', en: 'Extension' },
  'Påbygg': { no: 'Påbygg', en: 'Addition' },
  'Ombygging': { no: 'Ombygging', en: 'Conversion' },
  'Transformasjon': { no: 'Transformasjon', en: 'Transformation' },
  'Rehabilitering': { no: 'Rehabilitering', en: 'Renovation' },
  'Restaurering': { no: 'Restaurering', en: 'Restoration' },
  'Kulturminne': { no: 'Kulturminne', en: 'Heritage' },
  'Vern': { no: 'Vern', en: 'Protected' },
  'Interiør': { no: 'Interiør', en: 'Interior' },
  'Interiørarkitektur': { no: 'Interiørarkitektur', en: 'Interior architecture' },
  'Kultur': { no: 'Kultur', en: 'Culture' },
  'Kulturbygg': { no: 'Kulturbygg', en: 'Cultural building' },
  'Besøkssenter': { no: 'Besøkssenter', en: 'Visitor centre' },
  'Konserthall': { no: 'Konserthall', en: 'Concert hall' },
  'Konserthus': { no: 'Konserthus', en: 'Concert hall' },
  'Kulturhus': { no: 'Kulturhus', en: 'Cultural centre' },
  'Museum': { no: 'Museum', en: 'Museum' },
  'Galleri': { no: 'Galleri', en: 'Gallery' },
  'Bibliotek': { no: 'Bibliotek', en: 'Library' },
  'Skole': { no: 'Skole', en: 'School' },
  'Barnehage': { no: 'Barnehage', en: 'Kindergarten' },
  'Utdanning': { no: 'Utdanning', en: 'Education' },
  'Klinikk': { no: 'Klinikk', en: 'Clinic' },
  'Helsebygg': { no: 'Helsebygg', en: 'Healthcare' },
  'Helsesenter': { no: 'Helsesenter', en: 'Health centre' },
  'Næring': { no: 'Næring', en: 'Commercial' },
  'Næringsbygg': { no: 'Næringsbygg', en: 'Commercial building' },
  'Kontor': { no: 'Kontor', en: 'Office' },
  'Hotell': { no: 'Hotell', en: 'Hotel' },
  'Restaurant': { no: 'Restaurant', en: 'Restaurant' },
  'Kafé': { no: 'Kafé', en: 'Café' },
  'Destinasjonsutvikling': { no: 'Destinasjonsutvikling', en: 'Destination development' },
  'Offentlig': { no: 'Offentlig', en: 'Public' },
  'Landskap': { no: 'Landskap', en: 'Landscape' },
  'Landskapsarkitektur': { no: 'Landskapsarkitektur', en: 'Landscape architecture' },
  'Uteareal': { no: 'Uteareal', en: 'Outdoor space' },
  'Hage': { no: 'Hage', en: 'Garden' },
  'Trearkitektur': { no: 'Trearkitektur', en: 'Timber architecture' },
  'Bærekraft': { no: 'Bærekraft', en: 'Sustainability' },
  'Mulighetsstudie': { no: 'Mulighetsstudie', en: 'Feasibility study' },
  'Konsept': { no: 'Konsept', en: 'Concept' },
  'Pris': { no: 'Pris', en: 'Award' },
  'Foredrag': { no: 'Foredrag', en: 'Lecture' },
  'Publikasjon': { no: 'Publikasjon', en: 'Publication' },
  'Podcast': { no: 'Podcast', en: 'Podcast' },
  'Utstilling': { no: 'Utstilling', en: 'Exhibition' },
  'Video': { no: 'Video', en: 'Video' },
  'Nyhet': { no: 'Nyhet', en: 'News' },
  'Nyheter': { no: 'Nyheter', en: 'News' },
  'Presse': { no: 'Presse', en: 'Press' },
};
