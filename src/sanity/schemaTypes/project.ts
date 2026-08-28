import { defineType, defineField } from 'sanity';
import AutocompleteStringInput from '../components/AutocompleteStringInput';

const currentYear = new Date().getFullYear();
const yearOptions = [];
for (let i = currentYear + 5; i >= currentYear - 40; i--) {
  yearOptions.push({ title: i.toString(), value: i });
}

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fieldsets: [
    {
      name: 'years',
      title: 'Prosjektår',
      options: { columns: 2 }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Genereres automatisk fra tittelen ved å klikke Generate.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hideFromOverview',
      title: 'Skjul fra oversikten',
      description: 'Skru på denne for å skjule prosjektet fra Work-siden og tag-filteret. Det vil fortsatt være tilgjengelig via direkte lenke hvis det ikke er satt som utkast.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'startYear',
      title: 'Startår',
      type: 'number',
      fieldset: 'years',
      initialValue: currentYear,
      options: {
        list: yearOptions,
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'completionYear',
      title: 'Ferdigstillelsesår / Sluttår',
      type: 'number',
      fieldset: 'years',
      options: {
        list: yearOptions,
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'type',
      title: 'Type (f.eks. Nybygg, Rehabilitering, Interiør, Utstilling)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'use',
      title: 'Bruk / Formål (f.eks. Bolig, Kulturell, Næring, Workplace)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Built', value: 'Built' },
          { title: 'Bygget', value: 'Bygget' },
          { title: 'Completed', value: 'Completed' },
          { title: 'Ferdigstilt', value: 'Ferdigstilt' },
          { title: 'On site', value: 'On site' },
          { title: 'Under bygging', value: 'Under bygging' },
          { title: 'In design', value: 'In design' },
          { title: 'I prosjektering', value: 'I prosjektering' },
          { title: 'Competition', value: 'Competition' },
          { title: 'Konkurranse', value: 'Konkurranse' },
          { title: 'Concept', value: 'Concept' },
          { title: 'Konsept', value: 'Konsept' },
          { title: 'Unbuilt', value: 'Unbuilt' },
          { title: 'Ikke realisert', value: 'Ikke realisert' },
          { title: 'Fictional', value: 'Fictional' },
          { title: 'Fiktivt', value: 'Fiktivt' }
        ],
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'contractor',
      title: 'Contractor',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'size',
      title: 'Størrelse',
      type: 'object',
      options: { columns: 2 },
      fields: [
        { 
          name: 'value', 
          title: 'Størrelse', 
          type: 'number',
          placeholder: 'f.eks. 250' 
        },
        {
          name: 'unit',
          title: 'Måleenhet',
          type: 'string',
          initialValue: ' m²',
          options: {
            list: [
              { title: ' m²', value: ' m²' },
              { title: ' kvm', value: ' kvm' },
              { title: ' sqm', value: ' sqm' },
              { title: ' sq ft', value: ' sq ft' }
            ],
            layout: 'dropdown'
          }
        }
      ]
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true, // Tillater beskjæring og fokuspunkt
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Viktig for universell utforming og SEO.',
        })
      ]
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Innhold og Oppbygging (Page Builder)',
      description: 'Bygg prosjektsiden ved å legge til tekst, bilder (med størrelse), autoplay-videoer (med caption), slideshows (planløsninger) og metadata. Blokker kan flyttes opp og ned.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'textBlock',
          title: 'Tekstblokk',
          fields: [
            defineField({
              name: 'title',
              title: 'Tittel / Overskrift (Valgfri)',
              type: 'string',
              description: 'Hvis du fyller ut tittel, får den overskriftsformatering. La stå tom om du kun ønsker tekst.'
            }),
            defineField({
              name: 'text',
              title: 'Tekst',
              type: 'array',
              of: [{ type: 'block' }]
            })
          ],
          preview: {
            select: { title: 'title', blocks: 'text' },
            prepare(selection) {
              const block = (selection.blocks || []).find((b: any) => b._type === 'block');
              const text = block
                ? block.children
                    ?.filter((c: any) => c._type === 'span')
                    ?.map((c: any) => c.text)
                    ?.join('')
                : '';
              return {
                title: selection.title ? `Tekst: ${selection.title}` : (text ? `Tekst: ${text.slice(0, 40)}...` : 'Tekstblokk'),
                subtitle: selection.title ? text : ''
              };
            }
          }
        },
        {
          type: 'object',
          name: 'imageBlock',
          title: 'Bildeblokk',
          fields: [
            defineField({
              name: 'image',
              title: 'Bilde',
              type: 'image',
              options: { hotspot: true }
            }),
            defineField({
              name: 'caption',
              title: 'Bildetekst / Caption (vises på hover)',
              type: 'string'
            }),
            defineField({
              name: 'size',
              title: 'Bildestørrelse',
              type: 'string',
              initialValue: 'medium',
              options: {
                list: [
                  { title: '2 kolonner (x-small)', value: 'xsmall' },
                  { title: '4 kolonner', value: 'small' },
                  { title: '6 kolonner', value: 'medium' },
                  { title: '8 kolonner', value: 'large' },
                  { title: 'Fullskjerm', value: 'full' }
                ],
                layout: 'radio'
              }
            })
          ],
          preview: {
            select: { media: 'image', caption: 'caption', size: 'size' },
            prepare(selection) {
              return {
                title: `Bildeblokk (${selection.size || 'medium'})`,
                subtitle: selection.caption || '',
                media: selection.media
              }
            }
          }
        },
        {
          type: 'object',
          name: 'videoBlock',
          title: 'Videoblokk (Autoplay MP4)',
          fields: [
            defineField({
              name: 'video',
              title: 'Autoplay Video (MP4)',
              type: 'file',
              description: 'Last opp en MP4-video som spilles automatisk uten lyd.',
              options: { accept: 'video/mp4' }
            }),
            defineField({
              name: 'caption',
              title: 'Bildetekst / Caption (vises på hover)',
              type: 'string'
            }),
            defineField({
              name: 'size',
              title: 'Videostørrelse',
              type: 'string',
              initialValue: 'medium',
              options: {
                list: [
                  { title: '2 kolonner (x-small)', value: 'xsmall' },
                  { title: '4 kolonner', value: 'small' },
                  { title: '6 kolonner', value: 'medium' },
                  { title: '8 kolonner', value: 'large' },
                  { title: 'Fullskjerm', value: 'full' }
                ],
                layout: 'radio'
              }
            })
          ],
          preview: {
            select: { caption: 'caption', size: 'size' },
            prepare(selection) {
              return {
                title: `Videoblokk (${selection.size || 'large'})`,
                subtitle: selection.caption || ''
              }
            }
          }
        },
        {
          type: 'object',
          name: 'slideshowBlock',
          title: 'Slideshow / Karusell (f.eks. Planløsning)',
          fields: [
            defineField({
              name: 'title',
              title: 'Tittel / Overskrift (Valgfri)',
              type: 'string'
            }),
            defineField({
              name: 'size',
              title: 'Slideshow-størrelse',
              type: 'string',
              initialValue: 'medium',
              options: {
                list: [
                  { title: '2 kolonner (x-small)', value: 'xsmall' },
                  { title: '4 kolonner', value: 'small' },
                  { title: '6 kolonner', value: 'medium' },
                  { title: '8 kolonner', value: 'large' },
                  { title: 'Fullskjerm', value: 'full' }
                ],
                layout: 'radio'
              }
            }),
            defineField({
              name: 'images',
              title: 'Bilder i Karusell / Slideshow',
              type: 'array',
              options: {
                layout: 'grid'
              },
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    { name: 'alt', type: 'string', title: 'Alt text' },
                    { name: 'caption', type: 'string', title: 'Bildetekst / Caption (vises på hover)' }
                  ]
                }
              ]
            })
          ],
          preview: {
            select: { title: 'title', images: 'images', size: 'size' },
            prepare(selection) {
              const count = selection.images ? selection.images.length : 0;
              return {
                title: `Slideshow (${count} bilder, ${selection.size || 'medium'})`,
                subtitle: selection.title || ''
              }
            }
          }
        },
        {
          type: 'object',
          name: 'metadataBlock',
          title: 'Prosjekt-metadata (Tabell over sted, type, status etc.)',
          fields: [
            defineField({
              name: 'title',
              title: 'Overoverskrift (Valgfri)',
              type: 'string',
              initialValue: 'Prosjektdetaljer'
            })
          ],
          preview: {
            select: { title: 'title' },
            prepare(selection) {
              return { title: selection.title || 'Prosjekt-metadata (Tabell)' }
            }
          }
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startYear: 'startYear',
      completionYear: 'completionYear',
      buildYear: 'buildYear',
      media: 'coverImage',
    },
    prepare(selection) {
      const year = selection.startYear
        ? selection.completionYear
          ? `${selection.startYear}–${selection.completionYear.toString().slice(-2)}`
          : `${selection.startYear}–`
        : selection.buildYear
        ? `${selection.buildYear}`
        : '';
      return {
        title: selection.title || 'Uten tittel',
        subtitle: year,
        media: selection.media
      };
    }
  },
});
