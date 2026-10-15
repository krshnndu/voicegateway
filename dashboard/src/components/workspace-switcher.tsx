// Placeholder workspace until auth exists: one organization with one project. The switchers that use
// it live in the top bar (org-switcher.tsx). URLs carry readable slugs, /org/default/project/<project
// name>/; the server keeps them unique when it stores organisations and projects.
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const project = (name: string) => ({ id: slug(name), name })

export const orgs = [{ id: "default", name: "Your organization", projects: [project("Default project")] }]
