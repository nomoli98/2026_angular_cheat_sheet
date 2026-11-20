```html index.html
<head>
  ...
  <!-- before first paint: no white flash -->
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
/* Bootstrap variables follow the theme */
body {
  background-color: var(--bs-tertiary-bg);
}

/* custom color: one per theme */
.my-box {
  background: #f8f9fa;
}
[data-bs-theme='dark'] .my-box {
  background: #212529;
}
```
