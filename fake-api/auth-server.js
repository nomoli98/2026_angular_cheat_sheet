// A tiny AUTH server, like a real backend would have (see src/app/pages/auth/token/TOKEN.md).
// It runs next to json-server: json-server keeps the data, this server does the security.
//
//   Angular ──▶ auth-server (localhost:3001) ──▶ json-server (localhost:3000) ──▶ db.json
//               bcrypt + JWT                     /securePeople
//
// POST /token/register  { name, email, password, ... }  → 201 { token, user }
// POST /token/login     { email, password }              → 200 { token, user }
// GET  /token/me        Authorization: Bearer <token>    → 200 user, or 401
// GET  /health                                           → 200 (Playwright waits for it)
//
// Plain Node (no Express) so every step is visible. Start it with `npm run api:auth`
// (`npm run dev` starts it with the others).

const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = 3001;
const DATA_URL = process.env.DATA_URL ?? 'http://localhost:3000/securePeople';
// ⚠️ DEMO secret. A real one is long, random, and comes from an environment variable.
const JWT_SECRET = process.env.JWT_SECRET ?? 'demo-secret-change-me';
const JWT_EXPIRES_IN = 60 * 60; // 1 hour, in seconds
const BCRYPT_ROUNDS = 10;

// ---------- the routes ----------

async function register(body) {
  const [taken] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
  if (taken) return [409, { message: 'email already taken' }];

  // The SERVER hashes: the browser only ever sends the password, over HTTPS in a real app
  const password = await bcrypt.hash(String(body.password ?? ''), BCRYPT_ROUNDS);
  const user = await data('', { method: 'POST', body: { ...body, password, role: 'user' } });
  return [201, { token: sign(user), user: withoutPassword(user) }];
}

async function login(body) {
  const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
  const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
  if (!ok) return [401, { message: 'bad credentials' }];

  // DEMO: the explain page can ask for a short token (5 to 3600 s) to see it expire
  const seconds = Number(body.expiresInSeconds);
  const expiresIn = seconds >= 5 && seconds <= 3600 ? seconds : JWT_EXPIRES_IN;
  return [200, { token: sign(user, expiresIn), user: withoutPassword(user) }];
}

async function me(headers) {
  const auth = headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return [401, { message: 'no token' }];

  let payload;
  try {
    // verify() checks the SIGNATURE (nobody changed it) and the EXPIRY (exp)
    payload = jwt.verify(auth.slice('Bearer '.length), JWT_SECRET);
  } catch (err) {
    return [401, { message: err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token' }];
  }

  const user = await data(`/${payload.sub}`).catch(() => null);
  if (!user) return [401, { message: 'user not found' }];
  return [200, withoutPassword(user)];
}

// ---------- helpers ----------

// What goes INSIDE the token: readable by anyone (it's only base64), so no secrets in it
function sign(user, expiresIn = JWT_EXPIRES_IN) {
  const payload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function withoutPassword({ password, ...user }) {
  return user;
}

// Talk to json-server (Node 18+ has fetch)
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
  // CORS: Angular (localhost:4200) calls another port. The Authorization header must be allowed.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end(); // the browser's "preflight"

  const send = ([status, json]) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(json));
  };

  try {
    const route = `${req.method} ${req.url.split('?')[0]}`;
    if (route === 'POST /token/register') return send(await register(await readBody(req)));
    if (route === 'POST /token/login') return send(await login(await readBody(req)));
    if (route === 'GET /token/me') return send(await me(req.headers));
    if (route === 'GET /health') return send([200, { ok: true }]);
    send([404, { message: 'not found' }]);
  } catch (err) {
    // usually: json-server isn't running
    send([502, { message: `data server error: ${err.message}` }]);
  }
});

server.listen(PORT, () =>
  console.log(`Auth server on http://localhost:${PORT} (data: ${DATA_URL})`),
);
