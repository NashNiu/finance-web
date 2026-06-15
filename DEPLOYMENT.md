# Deployment Guide — 青账 (public server)

This deploys the app to a single Linux server, publicly accessible, using **one
origin**: nginx serves the built frontend and reverse-proxies `/api` to the
backend. No CORS, no hardcoded backend host.

```
visitor ──▶ https://your-domain.com/         → static frontend (dist/)
            └▶ https://your-domain.com/api/   → nginx → 127.0.0.1:3000 (backend)
```

## Prerequisites (on the server)

- Node.js 18+ and npm
- MySQL 8+ running locally
- nginx
- A domain name pointed at the server's IP (for HTTPS)
- Optional: a process manager (pm2) to keep the backend running

---

## 1. Backend (`finance-server`)

```bash
# Clone and install
git clone <finance-server repo> /opt/finance-server
cd /opt/finance-server
npm ci

# Configure production env
cp .env.production.example .env
#   edit .env:
#     DATABASE_URL  → a dedicated MySQL user (not root)
#     JWT_SECRET    → openssl rand -hex 32
#     HOST=127.0.0.1   (listen on localhost only; nginx fronts it)
#     PORT=3000

# Create schema + seed default categories
npm run prisma:migrate -- --name init   # or: npx prisma migrate deploy
npm run prisma:seed

# Build and run
npm run build
node dist/main          # or use pm2 (recommended): see below
```

Keep it running with pm2:

```bash
sudo npm i -g pm2
pm2 start dist/main.js --name finance-server
pm2 save
pm2 startup            # follow the printed command to enable on boot
```

The backend now listens on `127.0.0.1:3000` — not directly reachable from the
internet, only via nginx.

> Note on migrations: `prisma migrate deploy` applies committed migrations
> without prompting and is the right command for servers. `npm run prisma:migrate`
> (migrate dev) is fine for the first setup but is intended for development.

---

## 2. Frontend (`finance-web`)

```bash
git clone <finance-web repo> /opt/finance-web
cd /opt/finance-web
npm ci

# Build. This picks up .env.production (VITE_API_BASE_URL=/api) automatically.
npm run build

# Publish the static files where nginx will serve them
sudo mkdir -p /var/www/finance-web
sudo cp -r dist/* /var/www/finance-web/
```

You do **not** set a backend URL here — the build uses the relative `/api` path,
which nginx routes to the backend in the next step.

---

## 3. nginx (ties them together)

A ready config is in [`deploy/nginx.conf`](deploy/nginx.conf).

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/finance
#   edit it: set `server_name your-domain.com` and confirm
#   `root /var/www/finance-web;` and the backend port (127.0.0.1:3000)
sudo ln -s /etc/nginx/sites-available/finance /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

The key detail: `location /api/ { proxy_pass http://127.0.0.1:3000; }` has **no
trailing slash**, so `/api/auth/login` is forwarded unchanged and matches the
backend's `/api` global prefix.

---

## 4. HTTPS (recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

certbot adds the TLS listener, certificate, and an HTTP→HTTPS redirect to the
nginx server block automatically. Re-running is idempotent; renewal is automatic.

---

## 5. Verify

```bash
# Backend is up locally
curl -s http://127.0.0.1:3000/api/categories   # → 401 (auth required) = working

# Public site serves the app
curl -sI https://your-domain.com/              # → 200, text/html

# API reachable through the proxy
curl -s https://your-domain.com/api/categories # → 401 (auth required) = proxy OK
```

Then open `https://your-domain.com/` in a browser, register an account, add a
record, and check the statistics page.

---

## Updating after code changes

```bash
# Backend
cd /opt/finance-server && git pull && npm ci && npx prisma migrate deploy && npm run build && pm2 restart finance-server

# Frontend
cd /opt/finance-web && git pull && npm ci && npm run build && sudo cp -r dist/* /var/www/finance-web/
```

## Notes & gotchas

- **Same-origin = no CORS.** Because nginx serves both the app and `/api` from
  one domain, the browser never makes a cross-origin request. If you ever split
  them onto different domains, set `CORS_ORIGIN` in the backend `.env` and change
  `VITE_API_BASE_URL` to the full API URL before building.
- **Hash routing.** The frontend uses `/#/...` routes, so deep links work on any
  static host without extra rewrite rules.
- **Secrets.** `.env` is gitignored on both repos — never commit real
  credentials. Only `.env.example` / `.env.production.example` are tracked.
- **DB user.** Use a dedicated MySQL user limited to the `finance` database, not
  root, in production.
