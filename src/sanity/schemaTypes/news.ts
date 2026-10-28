import { defineType, defineField } from 'sanity';
import { TranslateStringInput, TranslateTextInput } from '../components/TranslateInputs';

export const newsType = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fieldsets: [
    {
      name: 'titleGroup',
      title: 'Tittel',
      options: { columns: 2 }
    },
    {
      name: 'summaryGroup',
      title: 'Sammendrag',
      options: { columns: 2 }
    }
  ],
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'Tags: Pris, Foredrag, Publikasjon, Podcast, Utstilling, Video',
      options: {
        list: [
          { title: 'Pris', value: 'Pris' },
          { title: 'Foredrag', value: 'Foredrag' },
          { title: 'Publikasjon', value: 'Publikasjon' },
          { title: 'Podcast', value: 'Podcast' },
          { title: 'Utstilling', value: 'Utstilling' },
          { title: 'Video', value: 'Video' },
        ],
      },
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
      name: 'category',
      title: 'Type',
      type: 'string',
      description: 'F.eks. Publikasjon, Nyheter, Presse, Pris, Podcast',
      options: {
        list: [
          { title: 'Nyheter', value: 'Nyheter' },
          { title: 'Presse', value: 'Presse' },
          { title: 'Publikasjon', value: 'Publikasjon' },
          { title: 'Pris', value: 'Pris' },
          { title: 'Podcast', value: 'Podcast' },
        ],
      },
    }),
    defineField({
      name: 'source',
      title: 'Hvem',
      type: 'string',
      description: 'F.eks. Architizer, New Norm, Studio Tenev...',
    }),
    defineField({
      name: 'medium',
      title: 'Hva',
      type: 'string',
      description: 'F.eks. Bok, Artikkel, Intervju, Tidsskrift, Forelesning, Flisworkshop...',
    }),
    defineField({
      name: 'project',
      title: 'Navn / Prosjekt (Tekst)',
      type: 'string',
      description: 'F.eks. Torgallmenningen 10, Laserlab, Studio, Geilo hytte...',
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Tilknyttet prosjekt',
      description: 'Koble denne nyhetssaken til prosjekt(er). Nyheten vil da automatisk vises som et lukket listeelement nederst på prosjektsiden. (Du kan koble herfra eller fra prosjektsiden, aldri duplikater).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'landingImage',
      title: 'Alternativt bilde for landingssiden (Forside-grid)',
      description: 'Valgfritt. Hvis du vil bruke et annet bilde på forsiden enn nyhetens hovedbilde.',
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
      date: 'date',
      tag: 'tag',
      source: 'source',
      media: 'image',
    },
    prepare(selection) {
      const year = selection.date ? new Date(selection.date).getFullYear() : '';
      const subtitle = [year, selection.tag, selection.source].filter(Boolean).join(' · ');
      return {
        title: selection.title,
        subtitle: subtitle || selection.date,
        media: selection.media,
      };
    },
  },
});
