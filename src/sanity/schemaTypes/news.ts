import { defineType, defineField } from 'sanity';

export const newsType = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'autoplayVideo',
      title: 'Autoplay Video (MP4)',
      type: 'file',
      description: 'Last opp en kort, lydløs video som skal spilles automatisk i gridet.',
      options: {
        accept: 'video/mp4'
      }
    }),
    defineField({
      name: 'link',
      title: 'External Link',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'date',
      media: 'image',
    },
  },
});
