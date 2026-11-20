# Prettier (code formatting)

> 📖 **Official docs:** [Prettier](https://prettier.io/docs/) · [Options](https://prettier.io/docs/options) · [Ignoring code](https://prettier.io/docs/ignore)

Prettier rewrites your files so they all look the same: quotes, indentation, line length, commas. In this repo it formats **every file when `npm run dev` starts**.

Demo page: `/dev/prettier`.

---

## How it works

- Prettier **throws away** your formatting and prints the code again from scratch, following `.prettierrc`. Same code in → same layout out, whoever wrote it.
- It only changes **how the code looks**, never what it does. It formats `.ts`, `.html`, `.css`, `.json` and `.md` (code blocks inside Markdown too, so the snippets follow the same style).
- `npm run dev` first runs `predev`: npm automatically runs a script called `pre<name>` before `<name>`. That's where `prettier --write .` sits.

```
npm run dev
  └─ predev: ensure-fake-api.js → prettier --write .   (whole repo formatted)
  └─ dev:    concurrently → json-server + auth server + ng serve
```

---

## 1. Install

```bash
npm install -D prettier
```

A dev dependency: only used while you write code, not in the built app.

---

## 2. `.prettierrc`

```json
{
    "printWidth": 100,
    "tabWidth": 4,
    "useTabs": false,
    "singleQuote": true,
    "overrides": [
        {
            "files": "*.html",
            "options": {
                "parser": "angular"
            }
        }
    ]
}
```

| Option                           | Effect                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `tabWidth: 4` + `useTabs: false` | indent with **4 spaces**                                                                      |
| `singleQuote: true`              | `'text'` instead of `"text"` in TS/JS. JSON and HTML attributes keep `"`: that's their syntax |
| `printWidth: 100`                | wrap lines after 100 characters                                                               |
| `*.html` → `parser: angular`     | understands `@if`, `@for`, `[prop]`, `(event)`                                                |

Match it in `.editorconfig`, so the editor types 4 spaces too:

```ini
[*]
indent_style = space
indent_size = 4
```

---

## 3. `.prettierignore`

Same syntax as `.gitignore`:

```
dist
.angular
coverage
node_modules
package-lock.json
fake-api/db.json
```

`fake-api/db.json` is skipped because json-server rewrites it (with its own formatting) on every POST/PUT/PATCH/DELETE.

---

## 4. Scripts in `package.json`

```json
"scripts": {
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "predev": "node scripts/ensure-fake-api.js && prettier --write . --log-level warn",
  "dev": "concurrently ..."
}
```

| Command                | Does                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | formats everything, then starts API + auth + Angular         |
| `npm run format`       | formats everything, nothing else                             |
| `npm run format:check` | lists the files that aren't formatted, fails if any (for CI) |

- `--write` changes the files, `--check` only reports.
- `.` = every file in the project, minus `.prettierignore`.
- `--log-level warn`: don't print every file name, only problems.

---

## 5. (Optional) Format on save in VS Code

Install the **Prettier - Code formatter** extension (`esbenp.prettier-vscode`). It reads the same `.prettierrc`.

`.vscode/settings.json`:

```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
}
```

---

## Gotchas

- Changed the config? Run `npm run format` once: Prettier doesn't touch files until it runs.
- A file with a syntax error can't be formatted: Prettier prints the error and leaves it alone.
- To keep one block as you wrote it, put `// prettier-ignore` (or `<!-- prettier-ignore -->` in HTML) on the line before it.
- Reformatting the whole repo touches almost every file: commit it **on its own**, so real changes stay readable in the history.
