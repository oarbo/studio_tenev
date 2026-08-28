import { type SchemaTypeDefinition } from 'sanity'
import { projectType } from './project'
import { newsType } from './news'
import studio from './studio'
import siteSettings from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, newsType, studio, siteSettings],
}
