# Cafe Country Road - QR Table Ordering

A QR-code based dine-in ordering app for **The Cafe Country Road**. A guest
scans the QR sticker on their table, browses the full menu, places an order
that is locked to **their table only**, pays via **Google Pay / UPI**, and
can play **mini games** while the kitchen prepares the food.

Built with **Vite + React**, fully responsive, with a custom animated
"neon roadside cafe at night" theme (no UI framework, no template).

## Features

- **Table-locked ordering.** The table number is read from the QR URL
  (`?table=NN`) and locked for the whole session. A guest cannot
  switch to another table from inside the app.
- **Full menu** transcribed from the cafe's printed menu: Maggi, Sandwich,
  Juices, Smoothie, Quick Bites, Rolls, Shakes, Mocktails, Cold Coffee,
  Pizza, Burger, Pasta, Ice Tea, Ice Cream, Coffee, Tea, Toast, Dessert,
  Bread - each category with its own icon.
- **Search**, expandable categories, quantity steppers and a live cart.
- **UPI / Google Pay payment** with a scannable QR generated on-device
  (no third-party service) plus an "Open in UPI app" deep link.
- **3 mini games** to pass the time: Coffee Tic-Tac-Toe (vs bot),
  Brew Memory Match, and Catch the Beans.
- **Responsive** mobile-first UI with subtle animations (twinkling stars,
  fairy lights, glowing animated road, floating brand badge).

## How the QR codes work

Generate one QR per table, each pointing at the deployed site with a table
number, e.g.:

```
https://your-domain.com/?table=1
https://your-domain.com/?table=2
https://your-domain.com/?table=3
```

Print and stick on each table. Opening the link with no/invalid `table`
shows a "scan your table QR" screen (with demo table links for testing).

## Run locally

```bash
npm install
npm run dev      # start dev server (Vite)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Then open the printed dev URL with a table param, e.g.
`http://localhost:5173/?table=5`.

## Payment configuration

The cafe's UPI details live in `src/data/menu.js` under `CAFE`:

```js
upiId: 'gpay-11250510730@okbizaxis',
payee: 'The Cafe Country Road'
```

Update these to change the payee account.

## Project structure

```
index.html
public/favicon.svg
src/
  main.jsx            # entry, mounts <App/>
  App.jsx             # screens: menu, cart, pay, order, nav
  data/menu.js        # full menu + cafe config
  hooks/useStore.jsx  # table lock + cart + order state
  components/PaymentQR.jsx
  games/Games.jsx     # 3 mini games
  lib/qrcode.js       # dependency-free QR generator
  styles/global.css   # theme + animations
  styles/ui.css       # component styles
```

> Note: "I've paid" currently marks the order as paid on the guest's device.
> For production, confirm payment via a UPI payment gateway / webhook before
> sending the order to the kitchen.
