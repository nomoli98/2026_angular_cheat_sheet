```bash terminal
npm install -D jsonwebtoken bcryptjs
node fake-api/auth-server.js     # or: npm run api:auth (npm run dev starts it too)
```

```js sign (login)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ?? 'demo-secret-change-me'; // a real one: long + random

async function login(body) {
  const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
  const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
  if (!ok) return [401, { message: 'bad credentials' }];

  // what goes IN the token: readable by anyone → no password, no secrets
  const payload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }); // adds iat + exp
  return [200, { token, user: withoutPassword(user) }];
}
```

```js verify (protected route)
async function me(headers) {
  const auth = headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return [401, { message: 'no token' }];

  let payload;
  try {
    // checks the SIGNATURE (nobody changed it) and the EXPIRY
    payload = jwt.verify(auth.slice('Bearer '.length), JWT_SECRET);
  } catch (err) {
    return [401, { message: err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token' }];
  }
  const user = await data(`/${payload.sub}`);
  return [200, withoutPassword(user)];
}
```

```js CORS
// Angular (localhost:4200) calls another port → the browser asks first (OPTIONS "preflight").
// The Authorization header must be allowed, or the browser blocks the request.
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
if (req.method === 'OPTIONS') return res.writeHead(204).end();
```
