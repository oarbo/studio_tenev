import { defineField, defineType } from 'sanity';

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
          title: 'Team / Personer',
          fields: [
            defineField({
              name: 'title',
              title: 'Seksjonstittel',
              type: 'string',
              initialValue: 'Team'
            }),
            defineField({
              name: 'members',
              title: 'Medlemmer',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'name', title: 'Navn', type: 'string' }),
                    defineField({ name: 'title', title: 'Tittel / Rolle', type: 'string' }),
                    defineField({ name: 'image', title: 'Bilde', type: 'image', options: { hotspot: true } })
                  ],
                  preview: {
                    select: { title: 'name', subtitle: 'title', media: 'image' }
                  }
                }
              ]
            })
          ],
          preview: {
            select: { title: 'title', members: 'members' },
            prepare(selection) {
              const count = selection.members ? selection.members.length : 0;
              return {
                title: selection.title || 'Team',
                subtitle: `${count} personer`
              }
            }
          }
        },
        {
          type: 'object',
          name: 'peopleListBlock',
          title: 'Samarbeidspartnere & Medarbeidere (Liste)',
          fields: [
            defineField({
              name: 'title',
              title: 'Seksjonstittel',
              type: 'string',
              initialValue: 'Collaborators & Team'
            }),
            defineField({
              name: 'items',
              title: 'Liste over navn / partnere',
              type: 'array',
              of: [{ type: 'string' }]
            })
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare(selection) {
              const count = selection.items ? selection.items.length : 0;
              return {
                title: selection.title || 'Samarbeidspartnere',
                subtitle: `${count} oppføringer`
              }
            }
          }
        },
        {
          type: 'object',
          name: 'applicationsBlock',
          title: 'Jobbsøknader / Applications',
          fields: [
            defineField({
              name: 'title',
              title: 'Seksjonstittel',
              type: 'string',
              initialValue: 'Applications'
            }),
            defineField({
              name: 'text',
              title: 'Informasjonstekst om søknader',
              type: 'text',
              rows: 3,
              description: 'f.eks. "We are always interested in hearing from talented architects and designers..."'
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
