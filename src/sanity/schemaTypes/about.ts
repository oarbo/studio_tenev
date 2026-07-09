import { defineType, defineField } from 'sanity';

export const aboutType = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }], // Riktekst (Portable Text)
    }),
  ],
});
