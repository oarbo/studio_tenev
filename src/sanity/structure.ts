import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .child(
          S.editor().schemaType('siteSettings').documentId('siteSettings')
        ),
      S.listItem()
        .title('About')
        .child(
          S.editor().schemaType('about').documentId('about')
        ),
      S.listItem()
        .title('People')
        .child(
          S.editor().schemaType('people').documentId('people')
        ),
      S.listItem()
        .title('Applications')
        .child(
          S.editor().schemaType('applications').documentId('applications')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !['siteSettings', 'about', 'people', 'applications'].includes(listItem.getId() as string)
      ),
    ])
