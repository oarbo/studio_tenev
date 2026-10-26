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
      name: 'featuredContent',
      title: 'Forside-innhold (Grid)',
      description: 'Velg og sorter prosjekter og nyheter som skal vises på forsiden. Layouten genereres automatisk basert på rekkefølge.',
      type: 'array',
      of: [
        {
          type: 'reference',
          title: 'Prosjekt eller Nyhet (standard)',
          to: [{ type: 'project' }, { type: 'news' }]
        },
        {
          type: 'object',
          name: 'customFeaturedItem',
          title: 'Sak med overstyrt bilde/video',
          fields: [
            defineField({
              name: 'item',
              title: 'Sak (Prosjekt eller Nyhet)',
              type: 'reference',
              to: [{ type: 'project' }, { type: 'news' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'overrideImage',
              title: 'Overstyr bilde på landingssiden (Valgfritt)',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'overrideVideo',
              title: 'Overstyr med videosnutt (Valgfri MP4)',
              description: 'Spilles av i loop uten lyd i gridet.',
              type: 'file',
              options: { accept: 'video/mp4' },
            }),
          ],
          preview: {
            select: {
              projectTitle: 'item.title',
              overrideMedia: 'overrideImage',
              projectCover: 'item.coverImage',
              newsMedia: 'item.image'
            },
            prepare(selection) {
              return {
                title: selection.projectTitle || 'Valgt sak',
                subtitle: 'Spesialtilpasset visning for forsiden',
                media: selection.overrideMedia || selection.projectCover || selection.newsMedia
              };
            }
          }
        }
      ],
    }),
    defineField({
      name: 'showGridOverlay',
      title: 'Vis Grid & Spacing (Hjelpeverktøy i dev)',
      description: 'Slå på for å vise hjelpelinjer for grid og avstander under utvikling.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tagTranslations',
      title: 'Tag-oversettelser (Underkategorier)',
      description: 'Legg til eller overstyr oversettelser fra norsk til engelsk for tags og underkategorier. Gjelder automatisk for alle prosjekter på siden.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'tagPair',
          title: 'Oversettelse',
          fields: [
            defineField({
              name: 'no',
              title: 'Norsk tag (f.eks. Tilbygg)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'en',
              title: 'Engelsk oversettelse (f.eks. Extension)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'no',
              subtitle: 'en',
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Uten navn',
                subtitle: subtitle ? `→ ${subtitle}` : 'Mangler engelsk',
              };
            },
          },
        },
      ],
    }),
  ],
})
