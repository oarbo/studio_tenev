export type Locale = 'no' | 'en';

export interface Translations {
  // Navigation
  work: string;
  studio: string;
  news: string;

  // Footer
  backToTop: string;
  information: string;
  termsAndConditions: string;
  privacyPolicy: string;
  privacyNotice: string;
  privacyNoticeLink: string;
  address: string;
  contact: string;
  language: string;
  allRightsReserved: string;
  orgNr: string;

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
    termsAndConditions: 'Imprint and Privacy policy',
    privacyPolicy: 'Imprint and Privacy policy',
    privacyNotice: 'Ved å sende inn godtar du vår',
    privacyNoticeLink: 'personvernerklæring',
    address: 'Adresse',
    contact: 'Kontakt',
    language: 'Språk',
    allRightsReserved: 'Alle rettigheter reservert',
    orgNr: 'Org nr',

    name: 'Navn',
    type: 'Type',
    size: 'Størrelse',
    year: 'År',
    status: 'Status',
    location: 'Sted',
    client: 'Oppdragsgiver',
    contractor: 'Entreprenør',
    photographer: 'Fotograf',
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
    termsAndConditions: 'Imprint and Privacy policy',
    privacyPolicy: 'Imprint and Privacy policy',
    privacyNotice: 'By submitting, you agree to our',
    privacyNoticeLink: 'privacy policy',
    address: 'Address',
    contact: 'Contact',
    language: 'Language',
    allRightsReserved: 'All rights reserved',
    orgNr: 'Org. no.',

    name: 'Name',
    type: 'Type',
    size: 'Size',
    year: 'Year',
    status: 'Status',
    location: 'Location',
    client: 'Client',
    contractor: 'Contractor',
    photographer: 'Photographer',
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
  'Fritidsbolig': { no: 'Fritidsbolig', en: 'Cabin' },
  'Hytte': { no: 'Hytte', en: 'Cabin' },
  'Leilighet': { no: 'Leilighet', en: 'Apartment' },
  'Nybygg': { no: 'Nybygg', en: 'New build' },
  'Transformasjon': { no: 'Transformasjon', en: 'Transformation' },
  'Rehabilitering': { no: 'Rehabilitering', en: 'Renovation' },
  'Interiør': { no: 'Interiør', en: 'Interior' },
  'Kultur': { no: 'Kultur', en: 'Culture' },
  'Næring': { no: 'Næring', en: 'Commercial' },
  'Offentlig': { no: 'Offentlig', en: 'Public' },
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
