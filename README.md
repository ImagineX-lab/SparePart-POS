# Gearbox POS — Full-Stack Spare Parts POS System

A complete point-of-sale system for a spare parts shop: Express + SQLite backend,
vanilla JS frontend. Because the data lives on the server (not in the browser),
multiple registers/devices can share the same live inventory once this is deployed
somewhere reachable on your network or the internet.

## Stack
- **Backend:** Node.js + Express, using Node's built-in `node:sqlite` module (no native
  compilation, no separate database server to install — just Node 22.5+).
- **Frontend:** Plain HTML/CSS/JS served as static files by Express, talking to the
  backend over a JSON REST API.
- **Storage:** `shop.db`, a single SQLite file created automatically on first run.

## Requirements
- Node.js **22.5 or later** (for `node:sqlite`). Check with `node --version`.

## Running it locally
```bash
npm install
npm start
```
Then open **http://localhost:3000** in your browser. The database seeds itself with
10 sample parts the first time it runs — edit or delete them from the Inventory tab.

For auto-restart while developing:
```bash
npm run dev
```

## Project structure
```
spare-parts-pos/
├── server.js          # Express app entry point
├── db.js              # SQLite schema, connection, seed data
├── routes/
│   ├── parts.js        # /api/parts        (inventory CRUD)
│   ├── customers.js     # /api/customers    (customer CRUD)
│   ├── sales.js          # /api/sales        (checkout + history)
│   └── misc.js            # /api/settings, /api/dashboard, /api/reset
├── public/
│   ├── index.html      # App shell
│   ├── style.css        # All styling
│   └── app.js             # Frontend logic (fetch calls to the API)
└── shop.db             # Created automatically — your live data
```

## API overview
| Method | Path                  | Purpose                                   |
|--------|------------------------|--------------------------------------------|
| GET    | /api/parts             | List all parts                             |
| POST   | /api/parts             | Create a part                              |
| PUT    | /api/parts/:id          | Update a part                              |
| DELETE | /api/parts/:id          | Delete a part                              |
| GET    | /api/customers          | List customers                             |
| POST   | /api/customers           | Create a customer                          |
| PUT    | /api/customers/:id        | Update a customer                          |
| DELETE | /api/customers/:id         | Delete a customer                          |
| GET    | /api/sales                | List all sales (with line items)           |
| POST   | /api/sales                 | Checkout — validates stock, records sale, decrements inventory in one transaction |
| GET    | /api/sales/:id               | Fetch one sale                             |
| GET    | /api/settings                  | Get shop settings                          |
| PUT    | /api/settings                    | Update shop settings                       |
| GET    | /api/dashboard                     | Today's revenue, low stock, top sellers    |
| POST   | /api/reset                            | Wipe and reseed all data                   |

## Deploying so multiple devices can share one inventory
Right now this runs as a single Node process with a local SQLite file — perfect for
one shop location on one machine acting as a server, with other devices on the same
Wi-Fi network hitting `http://<that-machine's-LAN-IP>:3000`.

To go further:
- **Same building, multiple registers:** run `npm start` on one always-on computer,
  and open its LAN IP address from the other registers' browsers.
- **Cloud hosting (access from anywhere):** deploy to a Node-friendly host (Railway,
  Render, Fly.io, a VPS, etc.). `shop.db` will live on that server's disk — most of
  these platforms need a persistent volume/disk add-on so the file survives restarts.
- **True multi-location / high concurrency:** swap SQLite for a hosted Postgres or
  MySQL database. The route files in `routes/` are the only place that touches SQL,
  so this is a contained change — `db.js` is the one file to replace.
- **Login / staff accounts:** there's no authentication yet. Anyone who can reach the
  server can use the register. Add a login step before deploying somewhere public.

## Notes
- Currency defaults to `Rs.` — change it any time in Settings.
- Checkout is wrapped in a SQL transaction: if any item runs out of stock mid-checkout,
  the whole sale is rejected and no partial changes are saved.
- "Reset all data" on the Settings page wipes parts, customers, and sales, then
  reseeds the 10 demo parts.

## Running it as a desktop app (Electron)
This project can also run as a self-contained desktop app — no browser, no terminal,
just a double-clickable icon — using Electron. `electron/main.js` starts the same
Express app internally on a random local-only port (127.0.0.1) and opens it in a
native window. `shop.db` is stored in the OS's per-user app-data folder in this mode,
so it survives app updates and isn't touched by reinstalls.

### Try it without building an installer
```bash
npm install
npm run electron
```

### Build an installable setup file
```bash
npm run dist:win     # Windows: an NSIS "Setup.exe" installer
npm run dist:mac      # macOS: a .dmg (must be run on a Mac)
npm run dist:linux    # Linux: AppImage + .deb
```
Electron-builder can only produce a Windows installer on Windows or Linux, and can
only produce a macOS installer on a Mac (Apple's tooling isn't available elsewhere).
Finished installers land in `dist/`.

`npm run dist` (no platform flag) builds for whatever OS you're running it on.

### Notes on this mode
- The Express server never listens on your LAN in this mode — it's bound to
  127.0.0.1 only, so it stays private to that one machine.
- To keep sharing one inventory across multiple registers on a network, keep using
  `npm start` (see "Deploying" above) instead of the Electron build — that mode is
  unchanged.
- No app icon is bundled yet; electron-builder will use its default icon until you
  add your own (`build/icon.ico`, `build/icon.icns`, `build/icon.png` — see the
  [electron-builder icon docs](https://www.electron.build/icons)).
