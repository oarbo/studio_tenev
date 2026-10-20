import { defineType, defineField } from 'sanity';
import AutocompleteStringInput from '../components/AutocompleteStringInput';
import BulkMediaSelectInput from '../components/BulkMediaSelectInput';
import { TranslateStringInput, TranslateTextInput, TranslateBlockInput, StatusEnInput } from '../components/TranslateInputs';

const currentYear = new Date().getFullYear();
const yearOptions = [];
for (let i = currentYear + 5; i >= currentYear - 40; i--) {
  yearOptions.push({ title: i.toString(), value: i });
}

export const projectType = defineType({
  name: 'project',
  title: 'Prosjekt',
  type: 'document',
  fieldsets: [
    {
      name: 'landingMediaGroup',
      title: 'Alternativ forside-visning (Forside-grid)',
      options: { columns: 2 }
    },
    {
      name: 'visibilityGroup',
      title: 'Synlighet i oversikter på Work-siden',
      options: { columns: 2 }
    },
    {
      name: 'summaryGroup',
      title: 'Kort prosjektbeskrivelse for Work-oversikten',
      options: { columns: 2 }
    },
    {
      name: 'titleGroup',
      title: 'Tittel',
      options: { columns: 2 }
    },
    {
      name: 'statusGroup',
      title: 'Status',
      options: { columns: 2 }
    },
    {
      name: 'years',
      title: 'Prosjektår',
      options: { columns: 2 }
    }
  ],
  fields: [
    defineField({
      name: 'coverImage',
      title: 'Representasjonsbilde (Hovedbilde for oversikter)',
      description: 'Hovedbildet som representerer prosjektet i karuseller, prosjektlister og oversikter.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternativ tekst (for SEO og tilgjengelighet)',
        })
      ]
    }),
    defineField({
      name: 'landingImage',
      title: 'Alternativt bilde for landingssiden',
      type: 'image',
      fieldset: 'landingMediaGroup',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternativ tekst',
        })
      ]
    }),
    defineField({
      name: 'landingVideo',
      title: 'Alternativ video for landingssiden',
      type: 'file',
      fieldset: 'landingMediaGroup',
      options: {
        accept: 'video/mp4'
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternativ tekst',
        })
      ]
    }),
    defineField({
      name: 'hideFromOverview',
      title: 'Skjul fra liste',
      type: 'boolean',
      fieldset: 'visibilityGroup',
      initialValue: false,
    }),
    defineField({
      name: 'hideFromCarousel',
      title: 'Skjul fra slides',
      type: 'boolean',
      fieldset: 'visibilityGroup',
      initialValue: false,
    }),
    defineField({
      name: 'summary',
      title: 'Norsk',
      type: 'text',
      rows: 4,
      fieldset: 'summaryGroup',
      components: { input: TranslateTextInput },
    }),
    defineField({
      name: 'summaryEn',
      title: 'Engelsk',
      type: 'text',
      rows: 4,
      fieldset: 'summaryGroup',
      components: { input: TranslateTextInput },
    }),
    defineField({
      name: 'title',
      title: 'Norsk',
      type: 'string',
      fieldset: 'titleGroup',
      components: { input: TranslateStringInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleEn',
      title: 'Engelsk',
      type: 'string',
      fieldset: 'titleGroup',
      components: { input: TranslateStringInput },
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
      name: 'carouselMedia',
      title: 'Prosjektkarusell (Bilder og video)',
      type: 'array',
      components: { input: BulkMediaSelectInput },
      options: {
        sortable: true,
      },
      of: [
        {
          type: 'image',
          title: 'Bilde',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternativ tekst (for SEO og tilgjengelighet)',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Tittel / Bildetekst (Valgfri)',
            }),
          ],
          preview: {
            select: {
              media: 'asset',
              alt: 'alt',
              caption: 'caption',
            },
            prepare(selection) {
              return {
                title: selection.alt || selection.caption || 'Bilde',
                subtitle: 'Bilde i karusell',
                media: selection.media,
              };
            },
          },
        },
        {
          type: 'object',
          name: 'carouselVideo',
          title: 'Video (MP4)',
          fields: [
            defineField({
              name: 'video',
              title: 'Videofil (MP4)',
              description: 'Last opp en MP4-video som spilles automatisk i loop.',
              type: 'file',
              options: { accept: 'video/mp4,video/*' },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'poster',
              title: 'Plakatbilde / Thumbnail (Valgfri)',
              description: 'Bilde som vises før videoen starter.',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'alt',
              title: 'Tittel / Beskrivelse',
              type: 'string',
            }),
            defineField({
              name: 'aspectRatio',
              title: 'Bredde/høyde-forhold (Format)',
              type: 'number',
              initialValue: 1.777,
              options: {
                list: [
                  { title: '16:9 (Landskap / standard)', value: 1.777 },
                  { title: '4:3', value: 1.333 },
                  { title: '1:1 (Kvadratisk)', value: 1.0 },
                  { title: '3:2', value: 1.5 },
                  { title: '9:16 (Vertikal / stående)', value: 0.5625 },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              media: 'poster',
            },
            prepare(selection) {
              return {
                title: selection.title || 'Video (MP4)',
                subtitle: 'Autoplay-video i karusell',
                media: selection.media,
              };
            },
          },
        },
      ],
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
      name: 'category',
      title: 'Hovedkategori',
      type: 'string',
      options: {
        list: [
          { title: 'Bolig', value: 'bolig' },
          { title: 'Næring', value: 'naering' },
          { title: 'Destinasjonsutvikling', value: 'destinasjonsutvikling' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Undertype / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'use',
      title: 'Bruk / Formål (utgått – slått sammen med Type)',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: true,
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'status',
      title: 'Norsk',
      type: 'string',
      fieldset: 'statusGroup',
      options: {
        list: [
          { title: 'Ferdigstilt', value: 'Ferdigstilt' },
          { title: 'Bygget', value: 'Bygget' },
          { title: 'Under bygging', value: 'Under bygging' },
          { title: 'Under utvikling', value: 'Under utvikling' },
          { title: 'I prosjektering', value: 'I prosjektering' },
          { title: 'Konkurranse', value: 'Konkurranse' },
          { title: 'Konsept', value: 'Konsept' },
          { title: 'Ideprosjekt', value: 'Ideprosjekt' },
          { title: 'Ikke realisert', value: 'Ikke realisert' },
          { title: 'Fiktivt', value: 'Fiktivt' }
        ],
        layout: 'dropdown'
      }
    }),
    defineField({
      name: 'statusEn',
      title: 'Engelsk (Vises automatisk)',
      type: 'string',
      fieldset: 'statusGroup',
      components: { input: StatusEnInput },
    }),
    defineField({
      name: 'location',
      title: 'Sted',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'client',
      title: 'Oppdragsgiver',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'contractor',
      title: 'Entreprenør',
      type: 'string',
      components: { input: AutocompleteStringInput }
    }),
    defineField({
      name: 'photographer',
      title: 'Fotograf / Rendring',
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
          title: 'Areal', 
          type: 'number',
          placeholder: 'f.eks. 250' 
        },
        {
          name: 'unit',
          title: 'Måleenhet',
          type: 'string',
          initialValue: ' m²',
          readOnly: true,
        }
      ]
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Sidebygger',
      description: 'Bygg prosjektsiden ved å legge til tekst, bilder (med størrelse), autoplay-videoer (med caption), slideshows (planløsninger) og metadata. Blokker kan flyttes opp og ned.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'textBlock',
          title: 'Tekstblokk',
          fieldsets: [
            {
              name: 'titleGroup',
              title: 'Tittel / Overskrift (Valgfri)',
              options: { columns: 2 }
            },
            {
              name: 'textGroup',
              title: 'Tekst',
              options: { columns: 2 }
            }
          ],
          fields: [
            defineField({
              name: 'title',
              title: 'Norsk',
              type: 'string',
              fieldset: 'titleGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'titleEn',
              title: 'Engelsk',
              type: 'string',
              fieldset: 'titleGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'text',
              title: 'Norsk',
              type: 'array',
              fieldset: 'textGroup',
              components: { input: TranslateBlockInput },
              of: [{ type: 'block' }]
            }),
            defineField({
              name: 'textEn',
              title: 'Engelsk',
              type: 'array',
              fieldset: 'textGroup',
              components: { input: TranslateBlockInput },
              of: [{ type: 'block' }]
            }),
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'title', blocks: 'text', disabled: 'disabled' },
            prepare(selection) {
              const block = (selection.blocks || []).find((b: any) => b._type === 'block');
              const text = block
                ? block.children
                    ?.filter((c: any) => c._type === 'span')
                    ?.map((c: any) => c.text)
                    ?.join('')
                : '';
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              const baseTitle = selection.title ? `Tekst: ${selection.title}` : (text ? `Tekst: ${text.slice(0, 40)}...` : 'Tekstblokk');
              return {
                title: `${prefix}${baseTitle}`,
                subtitle: selection.title ? text : ''
              };
            }
          }
        },
        {
          type: 'object',
          name: 'imageBlock',
          title: 'Bildeblokk',
          fieldsets: [
            {
              name: 'captionGroup',
              title: 'Bildetekst / Caption (vises på hover)',
              options: { columns: 2 }
            }
          ],
          fields: [
            defineField({
              name: 'image',
              title: 'Bilde',
              type: 'image',
              options: { hotspot: true }
            }),
            defineField({
              name: 'caption',
              title: 'Norsk',
              type: 'string',
              fieldset: 'captionGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'captionEn',
              title: 'Engelsk',
              type: 'string',
              fieldset: 'captionGroup',
              components: { input: TranslateStringInput },
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
            }),
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { media: 'image', caption: 'caption', size: 'size', disabled: 'disabled' },
            prepare(selection) {
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return {
                title: `${prefix}Bildeblokk (${selection.size || 'medium'})`,
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
          fieldsets: [
            {
              name: 'captionGroup',
              title: 'Videotekst / Caption (vises på hover)',
              options: { columns: 2 }
            }
          ],
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
              title: 'Norsk',
              type: 'string',
              fieldset: 'captionGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'captionEn',
              title: 'Engelsk',
              type: 'string',
              fieldset: 'captionGroup',
              components: { input: TranslateStringInput },
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
            }),
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { caption: 'caption', size: 'size', disabled: 'disabled' },
            prepare(selection) {
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return {
                title: `${prefix}Videoblokk (${selection.size || 'large'})`,
                subtitle: selection.caption || ''
              }
            }
          }
        },
        {
          type: 'object',
          name: 'carouselBlock',
          title: 'Karusell (Bilder og Video)',
          description: 'Horisontal karusell med bilder og/eller autoplay-videoer (MP4).',
          fields: [
            defineField({
              name: 'title',
              title: 'Tittel / Overskrift (Valgfri)',
              type: 'string',
            }),
            defineField({
              name: 'isDrawings',
              title: 'Er dette arkitektoniske tegninger / planer?',
              description: 'Hvis denne er huket av, styles karusellen som tekniske linjetegninger og plasseres under prosjektteksten.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'items',
              title: 'Medier i karusellen (Bilder og video)',
              type: 'array',
              components: { input: BulkMediaSelectInput },
              options: {
                sortable: true,
              },
              of: [
                {
                  type: 'image',
                  title: 'Bilde',
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: 'alt',
                      type: 'string',
                      title: 'Alternativ tekst / Tittel',
                    }),
                    defineField({
                      name: 'caption',
                      type: 'string',
                      title: 'Bildetekst',
                    }),
                  ],
                  preview: {
                    select: {
                      media: 'asset',
                      alt: 'alt',
                      caption: 'caption',
                    },
                    prepare(selection) {
                      return {
                        title: selection.alt || selection.caption || 'Bilde',
                        subtitle: 'Bilde',
                        media: selection.media,
                      };
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'carouselVideo',
                  title: 'Video (MP4)',
                  fields: [
                    defineField({
                      name: 'video',
                      title: 'Videofil (MP4)',
                      type: 'file',
                      options: { accept: 'video/mp4,video/*' },
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'poster',
                      title: 'Plakatbilde / Thumbnail (Valgfri)',
                      type: 'image',
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: 'alt',
                      title: 'Tittel / Beskrivelse',
                      type: 'string',
                    }),
                    defineField({
                      name: 'aspectRatio',
                      title: 'Bredde/høyde-forhold (Format)',
                      type: 'number',
                      initialValue: 1.777,
                      options: {
                        list: [
                          { title: '16:9 (Landskap / standard)', value: 1.777 },
                          { title: '4:3', value: 1.333 },
                          { title: '1:1 (Kvadratisk)', value: 1.0 },
                          { title: '3:2', value: 1.5 },
                          { title: '9:16 (Vertikal / stående)', value: 0.5625 },
                        ],
                      },
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'alt',
                      media: 'poster',
                    },
                    prepare(selection) {
                      return {
                        title: selection.title || 'Video (MP4)',
                        subtitle: 'Autoplay-video',
                        media: selection.media,
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              items: 'items',
              isDrawings: 'isDrawings',
              disabled: 'disabled',
            },
            prepare(selection) {
              const count = Array.isArray(selection.items) ? selection.items.length : 0;
              const typeLabel = selection.isDrawings ? 'Tegninger/Planer' : 'Bilder/Video';
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return {
                title: `${prefix}${selection.title ? `Karusell: ${selection.title}` : `Karusell (${typeLabel})`}`,
                subtitle: `${count} medier lagt til`,
              };
            },
          },
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
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
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
            select: { title: 'title', images: 'images', size: 'size', disabled: 'disabled' },
            prepare(selection) {
              const count = selection.images ? selection.images.length : 0;
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return {
                title: `${prefix}Slideshow (${count} bilder, ${selection.size || 'medium'})`,
                subtitle: selection.title || ''
              }
            }
          }
        },
        {
          type: 'object',
          name: 'columnsBlock',
          title: 'Kolonner / Rad (2–3 kolonner)',
          fields: [
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'columnsCount',
              title: 'Antall kolonner',
              type: 'string',
              initialValue: 'auto',
              options: {
                list: [
                  { title: 'Auto (2 kolonner ved 2 elementer, 3 ved 3)', value: 'auto' },
                  { title: '2 kolonner', value: '2' },
                  { title: '3 kolonner', value: '3' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
            }),
            defineField({
              name: 'size',
              title: 'Bredde på raden',
              type: 'string',
              initialValue: 'medium',
              options: {
                list: [
                  { title: '8 kolonner (Standard innholdsbredde)', value: 'medium' },
                  { title: '12 kolonner (Full bredde)', value: 'large' },
                  { title: '6 kolonner (Smalere)', value: 'small' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
            }),
            defineField({
              name: 'verticalAlign',
              title: 'Vertikal justering',
              type: 'string',
              initialValue: 'top',
              options: {
                list: [
                  { title: 'Toppstilt (Standard)', value: 'top' },
                  { title: 'Sentrert', value: 'center' },
                  { title: 'Bunnstilt', value: 'bottom' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
            }),
            defineField({
              name: 'columns',
              title: 'Kolonner / Innhold',
              description: 'Legg til 2 eller 3 kolonner. Hver kolonne kan være et bilde, video, tekst eller stå tom/blank.',
              type: 'array',
              validation: (Rule) => Rule.max(3).error('Maks 3 kolonner per rad.'),
              of: [
                {
                  type: 'object',
                  name: 'columnImage',
                  title: 'Bilde',
                  fieldsets: [
                    {
                      name: 'captionGroup',
                      title: 'Bildetekst / Caption (vises på hover)',
                      options: { columns: 2 }
                    }
                  ],
                  fields: [
                    defineField({
                      name: 'image',
                      title: 'Bilde',
                      type: 'image',
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: 'caption',
                      title: 'Norsk',
                      type: 'string',
                      fieldset: 'captionGroup',
                      components: { input: TranslateStringInput },
                    }),
                    defineField({
                      name: 'captionEn',
                      title: 'Engelsk',
                      type: 'string',
                      fieldset: 'captionGroup',
                      components: { input: TranslateStringInput },
                    }),
                    defineField({
                      name: 'aspectRatio',
                      title: 'Bildeformat (Valgfritt)',
                      type: 'string',
                      initialValue: 'auto',
                      options: {
                        list: [
                          { title: 'Originalt / Naturlig', value: 'auto' },
                          { title: 'Kvadratisk (1:1)', value: '1/1' },
                          { title: 'Landskap (4:3)', value: '4/3' },
                          { title: 'Landskap (16:9)', value: '16/9' },
                          { title: 'Portrett (3:4)', value: '3/4' },
                        ],
                      },
                    }),
                  ],
                  preview: {
                    select: { media: 'image', caption: 'caption' },
                    prepare(selection) {
                      return {
                        title: 'Bilde',
                        subtitle: selection.caption || '',
                        media: selection.media,
                      };
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'columnVideo',
                  title: 'Video (MP4)',
                  fieldsets: [
                    {
                      name: 'captionGroup',
                      title: 'Videotekst / Caption (vises på hover)',
                      options: { columns: 2 }
                    }
                  ],
                  fields: [
                    defineField({
                      name: 'video',
                      title: 'Autoplay Video (MP4)',
                      type: 'file',
                      options: { accept: 'video/mp4' },
                    }),
                    defineField({
                      name: 'caption',
                      title: 'Norsk',
                      type: 'string',
                      fieldset: 'captionGroup',
                      components: { input: TranslateStringInput },
                    }),
                    defineField({
                      name: 'captionEn',
                      title: 'Engelsk',
                      type: 'string',
                      fieldset: 'captionGroup',
                      components: { input: TranslateStringInput },
                    }),
                  ],
                  preview: {
                    select: { caption: 'caption' },
                    prepare(selection) {
                      return {
                        title: 'Video (MP4)',
                        subtitle: selection.caption || '',
                      };
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'columnText',
                  title: 'Tekst',
                  fieldsets: [
                    {
                      name: 'titleGroup',
                      title: 'Tittel / Overskrift (Valgfri)',
                      options: { columns: 2 }
                    },
                    {
                      name: 'textGroup',
                      title: 'Tekst',
                      options: { columns: 2 }
                    }
                  ],
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Norsk',
                      type: 'string',
                      fieldset: 'titleGroup',
                      components: { input: TranslateStringInput },
                    }),
                    defineField({
                      name: 'titleEn',
                      title: 'Engelsk',
                      type: 'string',
                      fieldset: 'titleGroup',
                      components: { input: TranslateStringInput },
                    }),
                    defineField({
                      name: 'text',
                      title: 'Norsk',
                      type: 'array',
                      fieldset: 'textGroup',
                      components: { input: TranslateBlockInput },
                      of: [{ type: 'block' }],
                    }),
                    defineField({
                      name: 'textEn',
                      title: 'Engelsk',
                      type: 'array',
                      fieldset: 'textGroup',
                      components: { input: TranslateBlockInput },
                      of: [{ type: 'block' }],
                    }),
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
                        title: selection.title ? `Tekst: ${selection.title}` : (text ? `Tekst: ${text.slice(0, 30)}...` : 'Tekst'),
                        subtitle: selection.title ? text : '',
                      };
                    },
                  },
                },
                {
                  type: 'object',
                  name: 'columnBlank',
                  title: 'Blank / Tom plass',
                  fields: [
                    defineField({
                      name: 'note',
                      title: 'Info',
                      type: 'string',
                      readOnly: true,
                      initialValue: 'Dette feltet forblir tomt for å skape luft eller asymmetri.',
                    }),
                  ],
                  preview: {
                    prepare() {
                      return {
                        title: 'Blank / Tom plass',
                        subtitle: 'Tomt felt (luft)',
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { columnsCount: 'columnsCount', columns: 'columns', disabled: 'disabled' },
            prepare(selection) {
              const count = Array.isArray(selection.columns) ? selection.columns.length : 0;
              const colsText = selection.columnsCount === '3' ? '3 kolonner' : selection.columnsCount === '2' ? '2 kolonner' : `${count} kolonner (auto)`;
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return {
                title: `${prefix}Kolonner / Rad (${colsText})`,
                subtitle: `${count} elementer lagt til`,
              };
            },
          },
        },
        {
          type: 'object',
          name: 'metadataBlock',
          title: 'Prosjekt-metadata (Tabell over sted, type, status etc.)',
          fields: [
            defineField({
              name: 'disabled',
              title: 'Deaktiver denne blokken',
              description: 'Huk av for å skjule denne blokken fra prosjektsiden uten å slette den.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'title',
              title: 'Overoverskrift (Valgfri)',
              type: 'string',
              initialValue: 'Prosjektdetaljer'
            })
          ],
          preview: {
            select: { title: 'title', disabled: 'disabled' },
            prepare(selection) {
              const prefix = selection.disabled ? '🚫 [Deaktivert] ' : '';
              return { title: `${prefix}${selection.title || 'Prosjekt-metadata (Tabell)'}` }
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
      carouselImage: 'carouselMedia.0.asset',
      carouselVideoPoster: 'carouselMedia.0.poster.asset',
    },
    prepare(selection) {
      let year = '';
      if (selection.startYear && selection.completionYear) {
        const s = selection.startYear.toString();
        const e = selection.completionYear.toString();
        if (s === e) {
          year = s;
        } else if (s.length === 4 && e.length === 4 && s.slice(0, 2) === e.slice(0, 2)) {
          year = `${s}–${e.slice(-2)}`;
        } else {
          year = `${s}–${e}`;
        }
      } else if (selection.startYear) {
        year = selection.startYear.toString();
      } else if (selection.completionYear) {
        year = selection.completionYear.toString();
      } else if (selection.buildYear) {
        year = selection.buildYear.toString();
      }
      return {
        title: selection.title || 'Uten tittel',
        subtitle: year,
        media: selection.media || selection.carouselImage || selection.carouselVideoPoster
      };
    }
  },
});
