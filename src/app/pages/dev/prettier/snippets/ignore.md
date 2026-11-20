```bash .prettierignore
# Build output and caches
dist
.angular
coverage

# Dependencies (npm writes the lock file itself)
node_modules
package-lock.json

# Live fake-API data: json-server rewrites it on every change
fake-api/db.json
```
