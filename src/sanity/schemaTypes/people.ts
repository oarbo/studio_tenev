import { defineType, defineField } from 'sanity';

export const peopleType = defineType({
  name: 'people',
  title: 'People',
  type: 'document',
  fields: [
    defineField({
      name: 'bio',
      title: 'Daniel Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'team',
      title: 'Team past and present',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
});
