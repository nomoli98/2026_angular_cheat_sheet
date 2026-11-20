```bash terminal
npm install -D jsonwebtoken bcryptjs
node fake-api/auth-server.js # or: npm run api:auth
```

```js sign (login)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ?? 'demo-secret-change-me'; // real one: env variable

async function login(body) {
    const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
    const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
    if (!ok) return [401, { message: 'bad credentials' }];

    // readable by anyone: no secrets
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
        // signature + expiry
        payload = jwt.verify(auth.slice('Bearer '.length), JWT_SECRET);
    } catch (err) {
        return [
            401,
            { message: err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token' },
        ];
    }
    const user = await data(`/${payload.sub}`);
    return [200, withoutPassword(user)];
}
```

```js CORS
// CORS preflight: allow Authorization
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
if (req.method === 'OPTIONS') return res.writeHead(204).end();
```
