// predev: installs json-server@0.17.4 + concurrently if needed
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const wanted = {
    'json-server': '0.17.4', // pinned: 1.0 beta differs
    concurrently: null, // any version
};

function installedVersion(pkg) {
    const file = path.join(process.cwd(), 'node_modules', pkg, 'package.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8')).version;
}

const missing = Object.entries(wanted)
    .filter(([pkg, version]) => {
        const current = installedVersion(pkg);
        return current === null || (version !== null && current !== version);
    })
    .map(([pkg, version]) => (version ? `${pkg}@${version}` : pkg));

if (missing.length === 0) {
    console.log('[fake-api] json-server + concurrently already installed ✔');
} else {
    console.log(`[fake-api] Installing: ${missing.join(' ')}`);
    execSync(`npm install -D ${missing.join(' ')}`, { stdio: 'inherit' });
}

// first run: db.json from the seed
const db = path.join('fake-api', 'db.json');
const seed = path.join('fake-api', 'db.seed.json');
if (!fs.existsSync(db) && fs.existsSync(seed)) {
    fs.copyFileSync(seed, db);
    console.log('[fake-api] Created fake-api/db.json from db.seed.json');
}
