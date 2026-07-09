import { type SchemaTypeDefinition } from 'sanity'
import { projectType } from './project'
import { newsType } from './news'
import { aboutType } from './about'
import { peopleType } from './people'
import { applicationsType } from './applications'
import siteSettings from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, newsType, aboutType, peopleType, applicationsType, siteSettings],
}
