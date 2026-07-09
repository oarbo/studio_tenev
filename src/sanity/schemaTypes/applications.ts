import { defineType, defineField } from 'sanity';

export const applicationsType = defineType({
  name: 'applications',
  title: 'Applications',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
      title: 'Kort setning',
      type: 'string',
      description: 'Skriv en kort setning om jobbsøknader, f.eks. "We are currently looking for..."',
    }),
  ],
});
