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
      name: 'heroItem',
      title: 'Hero Content (Forsidebilde)',
      description: 'Velg ett prosjekt eller én nyhetssak som skal vises stort på forsiden.',
      type: 'reference',
      to: [{ type: 'project' }, { type: 'news' }],
    }),
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
      name: 'email',
      title: 'E-post',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
  ],
})
