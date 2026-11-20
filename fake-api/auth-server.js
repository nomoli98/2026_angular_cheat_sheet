// Auth server (bcrypt + JWT) in front of json-server, see TOKEN.md

const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = 3001;
const DATA_URL = process.env.DATA_URL ?? 'http://localhost:3000/securePeople';
// ⚠️ demo secret: a real one comes from an env variable
const JWT_SECRET = process.env.JWT_SECRET ?? 'demo-secret-change-me';
const JWT_EXPIRES_IN = 60 * 60; // 1 hour
const BCRYPT_ROUNDS = 10;

// ---------- the routes ----------

async function register(body) {
    const [taken] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
    if (taken) return [409, { message: 'email already taken' }];

    // the server hashes, never the browser
    const password = await bcrypt.hash(String(body.password ?? ''), BCRYPT_ROUNDS);
    const user = await data('', { method: 'POST', body: { ...body, password, role: 'user' } });
    return [201, { token: sign(user), user: withoutPassword(user) }];
}

async function login(body) {
    const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
    const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
    if (!ok) return [401, { message: 'bad credentials' }];

    // demo: short token, to watch it expire
    const seconds = Number(body.expiresInSeconds);
    const expiresIn = seconds >= 5 && seconds <= 3600 ? seconds : JWT_EXPIRES_IN;
    return [200, { token: sign(user, expiresIn), user: withoutPassword(user) }];
}

// logged in (any role)
async function me(headers) {
    const [user, error] = await authenticate(headers);
    if (error) return error;
    return [200, withoutPassword(user)];
}

// admin only: the real authorization check
async function users(headers) {
    const [user, error] = await authenticate(headers); // 401: who are you?
    if (error) return error;
    if (user.role !== 'admin') return [403, { message: 'forbidden' }]; // 403: allowed?
    const all = await data('');
    return [200, all.map(withoutPassword)];
}

// ---------- authentication: who is calling? ----------

// [user, null] or [null, 401]. Role read from the DB, not the token
async function authenticate(headers) {
    const auth = headers['authorization'] ?? '';
    if (!auth.startsWith('Bearer ')) return [null, [401, { message: 'no token' }]];

    let payload;
    try {
        // checks signature + expiry
        payload = jwt.verify(auth.slice('Bearer '.length), JWT_SECRET);
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token';
        return [null, [401, { message }]];
    }

    const user = await data(`/${payload.sub}`).catch(() => null);
    if (!user) return [null, [401, { message: 'user not found' }]];
    return [user, null];
}

// ---------- helpers ----------

// readable by anyone: no secrets
function sign(user, expiresIn = JWT_EXPIRES_IN) {
    const payload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function withoutPassword({ password, ...user }) {
    return user;
}

// talk to json-server
async function data(path, { method = 'GET', body } = {}) {
    const res = await fetch(DATA_URL + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`json-server answered ${res.status}`);
    return res.json();
}

function readBody(req) {
    return new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch {
                resolve({});
            }
        });
    });
}

// ---------- the server ----------

const server = http.createServer(async (req, res) => {
    // CORS: allow the Authorization header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.writeHead(204).end(); // preflight

    const send = ([status, json]) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(json));
    };

    try {
        const route = `${req.method} ${req.url.split('?')[0]}`;
        if (route === 'POST /token/register') return send(await register(await readBody(req)));
        if (route === 'POST /token/login') return send(await login(await readBody(req)));
        if (route === 'GET /token/me') return send(await me(req.headers));
        if (route === 'GET /token/users') return send(await users(req.headers));
        if (route === 'GET /health') return send([200, { ok: true }]);
        send([404, { message: 'not found' }]);
    } catch (err) {
        // json-server not running?
        send([502, { message: `data server error: ${err.message}` }]);
    }
});

server.listen(PORT, () =>
    console.log(`Auth server on http://localhost:${PORT} (data: ${DATA_URL})`),
);
