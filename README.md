# Cafe Country Road - QR Table Ordering

A QR-code based dine-in ordering app for **The Cafe Country Road**. A guest
scans the QR sticker on their table, browses the full menu, places an order
locked to **their table only**, pays via **Google Pay / UPI**, and can play
**mini games** while the kitchen prepares the food.

Built with **Vite + React**, fully responsive, with a custom animated
"neon roadside cafe at night" theme.

## Features

- **Signed, tamper-resistant table tokens** (see below).
- **Full menu** transcribed from the cafe's printed menu, each category with
  its own icon, plus search, expandable categories and a live cart.
- **UPI / Google Pay payment** with a scannable QR + "Open in UPI app" link.
- **3 mini games**: Coffee Tic-Tac-Toe, Brew Memory Match, Catch the Beans.
- **Responsive** mobile-first UI with subtle animations.

## Stopping table-number tampering

A plain `?table=5` URL can be edited by a guest to `?table=8` to order
against another table. To prevent that, each table QR encodes a **signed
token**:

```
?t=5&k=<HMAC-SHA256 signature of the table number>
```

On load the app recomputes the signature (`src/lib/tableToken.js`) and only
accepts the table when it matches. If a guest edits the number, the signature
no longer matches and they see an **"Invalid table link"** screen instead of
being able to order. Old unsigned `?table=N` links are also rejected.

### Generating table QR codes (staff)

Open `/qr-tool.html` on the deployed site (or locally), enter the site URL
and a table number, and it produces the signed link + a scannable QR to print.
The tool uses the **same secret** as the app.

### Important: this is not a full security boundary

Because the signing secret ships inside the front-end bundle, a determined
attacker could extract it. The signed token only stops **casual URL editing**.

For true tamper-proofing you need a **backend**:

1. The QR opens a server endpoint / the server issues a short-lived signed
   session bound to the table.
2. Orders are submitted to an API; the **server** decides the table from the
   verified token - never trusting the table value sent by the browser.
3. Payment is confirmed via a UPI gateway/webhook before the kitchen ticket
   is created.

`verifyTableTokenRemote()` in `src/lib/tableToken.js` is the hook where you
would call that backend. Also move `SECRET` to a server-side env var.

## Run locally

```bash
npm install
npm run dev      # start dev server (Vite)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Open a signed link, e.g. generated from `/qr-tool.html`, like
`http://localhost:5173/?t=5&k=XXXX`.

## Payment configuration

Cafe UPI details live in `src/data/menu.js` under `CAFE` (`upiId`, `payee`).

## Project structure

```
index.html
public/
  favicon.svg
  qr-tool.html        # staff: generate signed table QR codes
src/
  main.jsx            # entry, mounts <App/>
  App.jsx             # screens: menu, cart, pay, order, nav, blocked
  data/menu.js        # full menu + cafe config
  hooks/useStore.jsx  # signed table verify + cart + order state
  components/PaymentQR.jsx
  games/Games.jsx     # 3 mini games
  lib/qrcode.js       # dependency-free QR generator (fallback)
  lib/tableToken.js   # HMAC sign/verify of the table number
  styles/global.css
  styles/ui.css
```
