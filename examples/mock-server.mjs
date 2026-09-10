// A tiny target server for the AuthzProbe demo.
//
// It implements the operations in petstore-openapi.yaml with DELIBERATE
// authorization bugs so a scan finds something real:
//
//   GET /users/{userId}                 -> SECURE   (checks ownership, 403 on mismatch)
//   GET /users/{userId}/orders/{id}     -> BOLA BUG (returns 200 for any user)
//   GET /admin/stats                    -> BFLA BUG (returns 200 for any user)
//
// No dependencies — plain Node http. Run with: node examples/mock-server.mjs
import { createServer } from 'node:http';

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4010;

// token -> the user id that token authenticates as.
const TOKENS = {
  'alice-token': 'alice-123',
  'bob-token': 'bob-456',
};

function authUser(req) {
  const header = req.headers['authorization'] || '';
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) return null;
  return TOKENS[match[1]] ?? null;
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(payload);
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  const user = authUser(req);

  if (!user) {
    return json(res, 401, { error: 'missing or invalid bearer token' });
  }

  // GET /users/{userId} — SECURE: only the owner may read their profile.
  let m = /^\/users\/([^/]+)$/.exec(pathname);
  if (m && req.method === 'GET') {
    const userId = decodeURIComponent(m[1]);
    if (userId !== user) {
      return json(res, 403, { error: 'forbidden: not your profile' });
    }
    return json(res, 200, { id: userId, name: userId, email: `${userId}@example.com` });
  }

  // GET /users/{userId}/orders/{orderId} — BUG (BOLA): no ownership check!
  m = /^\/users\/([^/]+)\/orders\/([^/]+)$/.exec(pathname);
  if (m && req.method === 'GET') {
    const userId = decodeURIComponent(m[1]);
    const orderId = decodeURIComponent(m[2]);
    // A correct implementation would verify userId === user. It does not.
    return json(res, 200, { orderId, userId, total: 42.0, items: ['widget'] });
  }

  // GET /admin/stats — BUG (BFLA): any authenticated user can read admin data.
  if (pathname === '/admin/stats' && req.method === 'GET') {
    // A correct implementation would require an admin role. It does not.
    return json(res, 200, { users: 2, orders: 128, revenue: 5376.0 });
  }

  return json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`[mock] Demo Orders API listening on http://localhost:${PORT}`);
  console.log('[mock] Tokens: alice-token -> alice-123, bob-token -> bob-456');
});
