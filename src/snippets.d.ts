// import .md files as text (page snippets)
declare module '*.md' {
  const content: string;
  export default content;
}
