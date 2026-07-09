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
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buildYear',
      title: 'Build year',
      type: 'number',
      initialValue: currentYear,
      options: {
        list: yearOptions,
        layout: 'dropdown'
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
          { title: 'Under prosjektering', value: 'Under prosjektering' },
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
        { name: 'value', title: 'Verdi', type: 'number' },
        {
          name: 'unit',
          title: 'Enhet',
          type: 'string',
          options: {
            list: [
              { title: 'kvm', value: 'kvm' },
              { title: 'm²', value: 'm²' },
              { title: 'sqm', value: 'sqm' },
              { title: 'sq ft', value: 'sq ft' }
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
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        { 
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }
          ]
        }
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }], // Sanity's Portable Text (riktekst)
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'buildYear',
      media: 'coverImage',
    },
  },
});
