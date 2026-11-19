```html index.html
<head>
  ...
  <!-- Set the theme BEFORE the page is drawn, so a dark-mode user never sees a white flash
       while Angular loads. ThemeService takes over after that (same rules). -->
  <script>
    try {
      var saved = localStorage.getItem('theme');
      var dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    } catch (e) {}
  </script>
</head>
```

```css styles.css
/* Your own colors: use Bootstrap's variables, they change with the theme */
body {
  background-color: var(--bs-tertiary-bg);
}

/* Need a color that Bootstrap doesn't have? Write one per theme */
.my-box {
  background: #f8f9fa;
}
[data-bs-theme='dark'] .my-box {
  background: #212529;
}
```
