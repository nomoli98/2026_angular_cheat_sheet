```css my.component.css
.my-box {
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    color: var(--bs-primary);
}
```

```css styles.css
:root {
    --bs-border-radius: 0.75rem;
}
```

```html index.html (dark mode)
<html lang="en" data-bs-theme="dark"></html>
```
