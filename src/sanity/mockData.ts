export const mockData = {
  projects: [
    {
      _id: 'proj-1',
      title: 'Skogstua',
      slug: 'skogstua',
      completionYear: 2024,
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      coverImageAlt: 'Skogstua eksteriør',
      gallery: [],
      body: []
    },
    {
      _id: 'proj-2',
      title: 'Kulturhuset Nord',
      slug: 'kulturhuset-nord',
      completionYear: 2023,
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
      coverImageAlt: 'Kulturhuset interiør',
      gallery: [],
      body: []
    }
  ],
  news: [
    {
      _id: 'news-1',
      title: 'Arkitektkontor vinner prisen for bærekraftig design',
      date: '2024-05-12T10:00:00Z',
      link: 'https://example.com/news-1'
    },
    {
      _id: 'news-2',
      title: 'Nye Skogstua ferdigstilt',
      date: '2024-03-20T10:00:00Z'
    }
  ],
  about: {
    body: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'Arkitektkontor AS er et tverrfaglig studio som jobber i krysningspunktet mellom byutvikling, arkitektur og design. Vi fokuserer på varige materialer og en strengt proporsjonal tilnærming til form.',
            marks: []
          }
        ]
      }
    ]
  },
  people: {
    bio: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 's1',
            text: 'Daniel has twenty five years\' experience working in architectural practices...',
            marks: []
          }
        ]
      }
    ],
    team: [
      'Kam Bava',
      'Neil Ditte',
      'Joseph Elbourn'
    ],
    collaborators: [
      'Brendan Hennessy Associates',
      'David Chipperfield Architects',
      'Davies Maguire'
    ]
  }
};
