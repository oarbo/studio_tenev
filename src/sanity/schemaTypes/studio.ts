import { defineField, defineType } from 'sanity';
import { TranslateStringInput, TranslateTextInput, TranslateBlockInput } from '../components/TranslateInputs';

export default defineType({
  name: 'studio',
  title: 'Studio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      initialValue: 'Studio',
      readOnly: true,
      hidden: true,
    }),

    // --- Page Builder ---
    defineField({
      name: 'contentBlocks',
      title: 'Innhold og Oppbygging (Page Builder)',
      description: 'Bygg Studio-siden ved å legge til tekst, bilder (med størrelse), autoplay-videoer, slideshows, team, samarbeidspartnere og jobbsøknader. Blokker kan flyttes opp og ned.',
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
          title: 'Slideshow / Karusell',
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
              title: 'Bilder i karusellen',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: 'caption',
                      title: 'Bildetekst (Valgfri)',
                      type: 'string'
                    })
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
                title: selection.title ? `Slideshow: ${selection.title}` : `Slideshow (${count} bilder)`,
                subtitle: `Størrelse: ${selection.size || 'medium'}`
              }
            }
          }
        },
        {
          type: 'object',
          name: 'teamBlock',
          title: 'Ansatte / Employees (Navneliste)',
          fields: [
            defineField({
              name: 'title',
              title: 'Seksjonstittel',
              type: 'string',
              initialValue: 'People'
            }),
            defineField({
              name: 'items',
              title: 'Navn (ett navn per linje)',
              type: 'array',
              of: [{ type: 'string' }]
            }),
            defineField({
              name: 'members',
              title: 'Medlemmer (Bakoverkompatibel)',
              type: 'array',
              hidden: ({ parent }) => !parent?.members || parent.members.length === 0,
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'name', title: 'Navn', type: 'string' }),
                  ],
                  preview: {
                    select: { title: 'name' }
                  }
                }
              ]
            })
          ],
          preview: {
            select: { title: 'title', items: 'items', members: 'members' },
            prepare(selection) {
              const count = (selection.items?.length || 0) + (selection.members?.length || 0);
              return {
                title: selection.title || 'People',
                subtitle: `${count} navn`
              }
            }
          }
        },
        {
          type: 'object',
          name: 'peopleListBlock',
          title: 'Tidligere ansatte / Navneliste',
          fields: [
            defineField({
              name: 'title',
              title: 'Seksjonstittel (f.eks. Former Employees)',
              type: 'string',
              initialValue: 'Former Employees'
            }),
            defineField({
              name: 'items',
              title: 'Navn (ett navn per linje)',
              type: 'array',
              of: [{ type: 'string' }]
            })
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare(selection) {
              const count = selection.items ? selection.items.length : 0;
              return {
                title: selection.title || 'Former Employees',
                subtitle: `${count} navn`
              }
            }
          }
        },
        {
          type: 'object',
          name: 'applicationsBlock',
          title: 'Jobbsøknader / Applications',
          fieldsets: [
            {
              name: 'titleGroup',
              title: 'Tittel',
              options: { columns: 2 }
            },
            {
              name: 'textGroup',
              title: 'Informasjonstekst om søknader',
              options: { columns: 2 }
            }
          ],
          fields: [
            defineField({
              name: 'title',
              title: 'Norsk',
              type: 'string',
              initialValue: 'Søknader',
              fieldset: 'titleGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'titleEn',
              title: 'Engelsk',
              type: 'string',
              initialValue: 'Applications',
              fieldset: 'titleGroup',
              components: { input: TranslateStringInput },
            }),
            defineField({
              name: 'text',
              title: 'Norsk',
              type: 'text',
              rows: 3,
              fieldset: 'textGroup',
              components: { input: TranslateTextInput },
            }),
            defineField({
              name: 'textEn',
              title: 'Engelsk',
              type: 'text',
              rows: 3,
              fieldset: 'textGroup',
              components: { input: TranslateTextInput },
            })
          ],
          preview: {
            select: { title: 'title', text: 'text' },
            prepare(selection) {
              return {
                title: selection.title || 'Applications',
                subtitle: selection.text ? selection.text.slice(0, 40) + '...' : ''
              }
            }
          }
        },
        {
          type: 'object',
          name: 'contactBlock',
          title: 'Kontaktinformasjon / Contact',
          fields: [
            defineField({ name: 'title', title: 'Seksjonstittel', type: 'string', initialValue: 'Contact' }),
            defineField({ name: 'studioName', title: 'Studio Navn', type: 'string' }),
            defineField({ name: 'address', title: 'Adresse', type: 'text', rows: 3 }),
            defineField({ name: 'email', title: 'E-post', type: 'string' }),
            defineField({ name: 'phone', title: 'Telefon', type: 'string' }),
            defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' })
          ],
          preview: {
            select: { title: 'title', email: 'email' },
            prepare(selection) {
              return {
                title: selection.title || 'Contact',
                subtitle: selection.email || ''
              }
            }
          }
        }
      ]
    }),

    // --- Global Kontaktinformasjon ---
    defineField({
      name: 'studioName',
      title: 'Studio Navn',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contactEmail',
      title: 'E-post',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Telefon',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
  ],
});
