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
        .title('Studio')
        .child(
          S.editor().schemaType('studio').documentId('studio')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !['siteSettings', 'studio', 'people', 'applications'].includes(listItem.getId() as string)
      ),
    ])
