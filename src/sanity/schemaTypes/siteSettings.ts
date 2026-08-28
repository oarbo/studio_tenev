import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Global Settings',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Bilde (Forside)',
      type: 'image',
      description: 'Dette brukes som fallback hvis karusellen er tom.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'landingCarousel',
      title: 'Karusell på forsiden',
      description: 'Velg prosjektene som skal rotere på den store karusellen helt øverst på forsiden.',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'project' }] }
      ],
    }),
    defineField({
      name: 'featuredContent',
      title: 'Forside-innhold (Grid)',
      description: 'Velg og sorter prosjekter og nyheter som skal vises på forsiden. Layouten genereres automatisk basert på rekkefølge (Chipperfield-mønster).',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'project' }, { type: 'news' }] }
      ],
    }),
    defineField({
      name: 'selectedWorks',
      title: 'Utvalgte prosjekter (Work-siden)',
      description: 'Velg prosjektene som skal vises i karusellen øverst på "Work"-siden.',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'project' }] }
      ],
    }),
    defineField({
      name: 'showGridOverlay',
      title: 'Vis Grid & Spacing (Hjelpeverktøy)',
      description: 'Slå på for å vise hjelpelinjer for grid og avstander på nettsiden (Gjelder for alle).',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
