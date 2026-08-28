# Sanity Studio Rules

1. **Isolation from Website Styles:** The Sanity Studio (`/admin`) MUST NOT inherit global CSS styles or layouts from the main frontend application. The Studio should always retain its default appearance (for example, standard font sizes and layouts). Ensure that global CSS like `globals.css` does not unintentionally break or alter the Sanity Studio UI.
2. **Appearance Changes:** NEVER modify the appearance or theming of the Sanity Studio unless the user explicitly requests it.
3. **New Features:** It is permitted and encouraged to proactively add new features, schemas, logic, or fields to the Sanity configuration without asking for permission, as long as it does not modify the visual theming of the Studio interface.
