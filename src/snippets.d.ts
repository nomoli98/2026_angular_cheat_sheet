// Lets TypeScript import .md files as text (see "loader" in angular.json).
// Used for the code snippets shown on the demo pages.
declare module '*.md' {
  const content: string;
  export default content;
}
