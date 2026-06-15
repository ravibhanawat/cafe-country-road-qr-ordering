import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './hooks/useStore.jsx'
import { CAFE, MENU } from './data/menu'
import PaymentQR from './components/PaymentQR.jsx'
import Games from './games/Games.jsx'

/* ============================================================
   Cafe Country Road - QR Table Ordering
   Flow: scan QR (?table=N) -> Menu -> Cart -> Pay (UPI QR) ->
   Order placed -> Games while you wait.
   A guest is locked to their own table only.
   ============================================================ */

export default function App() {
  return (
    <StoreProvider>
      <div className="stars" />
      <FairyLights />
      <Shell />
    </StoreProvider>
  )
}

function FairyLights() {
  const bulbs = Array.from({ length: 24 })
  return <div className="fairy-lights">{bulbs.map((_, i) => <span key={i} />)}</div>
}

function Shell() {
  const store = useStore()
  const [tab, setTab] = useState('menu')

  // No valid table in the URL => block ordering (anti table-spoofing).
  if (!store.table) return <NoTable />

  return (
    <div className="app">
      <div className="container">
        <Header />
        <div className="road" />
        {tab === 'menu' && <MenuView onCheckout={() => setTab('cart')} />}
        {tab === 'cart' && <CartView goMenu={() => setTab('menu')} goGames={() => setTab('games')} />}
        {tab === 'games' && <Games />}
      </div>
      <BottomNav tab={tab} setTab={setTab} count={store.totals.count} hasOrder={!!store.order} />
    </div>
  )
}

function Header() {
  const { table } = useStore()
  return (
    <header className="center" style={{ paddingTop: 70 }}>
      <div className="brand">
        <div className="brand-badge">\u2615</div>
        <div className="brand-title">
          {CAFE.name.replace('The ', '')}
          <small>ALWAYS FRESH</small>
        </div>
      </div>
      <div className="mt-2">
        <span className="table-chip"><span className="dot" /> Table {table} \u2022 Dine-in</span>
      </div>
    </header>
  )
}

function NoTable() {
  return (
    <div className="app">
      <div className="container center" style={{ paddingTop: 90 }}>
        <div className="brand">
          <div className="brand-badge">\u2615</div>
          <div className="brand-title">Cafe Country Road<small>ALWAYS FRESH</small></div>
        </div>
        <div className="card mt-4" style={{ padding: 28, maxWidth: 460, margin: '32px auto' }}>
          <h2 className="amber-text">Scan your table QR \uD83D\uDCF1</h2>
          <p className="muted mt-2">
            To place an order, please scan the QR code on your table. It opens this
            page with your table number so your order reaches the right table.
          </p>
          <p className="muted mt-2" style={{ fontSize: 13 }}>
            Tip for staff: each table's QR points to
            <code style={{ color: 'var(--amber-bright)' }}> ?table=NUMBER</code>
          </p>
          <div className="mt-3 row gap" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6].map(n => (
              <a key={n} className="btn btn-ghost" href={'?table=' + n}>Demo: Table {n}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Menu ---------------- */
function MenuView({ onCheckout }) {
  const store = useStore()
  const [openCat, setOpenCat] = useState(MENU[0].id)
  const [q, setQ] = useState('')

  const filtered = MENU.map(cat => ({
    ...cat,
    items: cat.items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()))
  })).filter(cat => cat.items.length)

  return (
    <div className="page-enter">
      <div className="search-wrap">
        <input
          className="search"
          placeholder="Search the menu\u2026 (e.g. maggi, pizza, mojito)"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {q && <p className="muted center mt-1">{filtered.reduce((s,c)=>s+c.items.length,0)} matches</p>}

      <div className="cat-list mt-2">
        {filtered.map(cat => {
          const open = q ? true : openCat === cat.id
          return (
            <section key={cat.id} className="card cat">
              <button className="cat-head" onClick={() => setOpenCat(open && !q ? null : cat.id)}>
                <span className="cat-ic">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-meta">{cat.items.length} items</span>
                <span className={'chev' + (open ? ' up' : '')}>\u25BE</span>
              </button>
              {open && (
                <div className="cat-items">
                  {cat.items.map(item => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {store.totals.count > 0 && (
        <button className="btn btn-primary floating-cta" onClick={onCheckout}>
          View cart \u2022 {store.totals.count} item{store.totals.count > 1 ? 's' : ''} \u2022 \u20B9{store.totals.amount}
        </button>
      )}
    </div>
  )
}

function ItemRow({ item }) {
  const { add, dec, qtyOf } = useStore()
  const qty = qtyOf(item.id)
  return (
    <div className="item-row">
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-price">\u20B9{item.price}</span>
      </div>
      {qty === 0 ? (
        <button className="btn btn-ghost add-btn" onClick={() => add(item)}>Add +</button>
      ) : (
        <div className="stepper">
          <button onClick={() => dec(item.id)}>\u2212</button>
          <span>{qty}</span>
          <button onClick={() => add(item)}>+</button>
        </div>
      )}
    </div>
  )
}

/* ---------------- Cart + Payment ---------------- */
function CartView({ goMenu, goGames }) {
  const store = useStore()
  const [stage, setStage] = useState('cart') // cart | pay | done
  const lines = store.totals.lines

  if (store.order && stage !== 'pay') {
    return <OrderPlaced goGames={goGames} goMenu={goMenu} />
  }

  if (!lines.length) {
    return (
      <div className="page-enter center" style={{ paddingTop: 30 }}>
        <p style={{ fontSize: 46 }}>\uD83D\uDED2</p>
        <h3 className="amber-text">Your cart is empty</h3>
        <p className="muted mt-1">Add something delicious from the menu.</p>
        <button className="btn btn-primary mt-3" onClick={goMenu}>Browse menu</button>
      </div>
    )
  }

  if (stage === 'pay') {
    const upiLink =
      'upi://pay?pa=' + encodeURIComponent(CAFE.upiId) +
      '&pn=' + encodeURIComponent(CAFE.payee) +
      '&am=' + store.totals.amount +
      '&cu=INR' +
      '&tn=' + encodeURIComponent('CCR Table ' + store.table)
    return (
      <div className="page-enter center">
        <h2 className="neon-text">Pay \u20B9{store.totals.amount}</h2>
        <p className="muted mt-1">Scan with Google Pay, PhonePe, Paytm or any UPI app</p>
        <div className="pay-card card mt-3">
          <div className="gpay-row"><span className="g">G</span> Pay \u2022 UPI</div>
          <PaymentQR value={upiLink} />
          <p className="muted mt-2" style={{ fontSize: 12, wordBreak: 'break-all' }}>UPI ID: {CAFE.upiId}</p>
          <a className="btn btn-ghost btn-block mt-2" href={upiLink}>Open in UPI app</a>
        </div>
        <p className="muted mt-2" style={{ fontSize: 13 }}>After paying, tap below to confirm your order.</p>
        <button
          className="btn btn-primary btn-block mt-2"
          onClick={() => { store.markPaid(); store.placeOrder(); }}
        >
          I've paid \u2022 Place order
        </button>
        <button className="btn btn-ghost btn-block mt-1" onClick={() => setStage('cart')}>Back to cart</button>
      </div>
    )
  }

  // cart stage
  return (
    <div className="page-enter">
      <h2 className="neon-text center">Your Order</h2>
      <p className="muted center mt-1">Table {store.table}</p>
      <div className="card mt-3" style={{ padding: 8 }}>
        {lines.map(l => (
          <div className="cart-line" key={l.item.id}>
            <div>
              <div className="item-name">{l.item.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>\u20B9{l.item.price} each</div>
            </div>
            <div className="stepper">
              <button onClick={() => store.dec(l.item.id)}>\u2212</button>
              <span>{l.qty}</span>
              <button onClick={() => store.add(l.item)}>+</button>
            </div>
            <div className="line-total">\u20B9{l.qty * l.item.price}</div>
          </div>
        ))}
      </div>

      <div className="card bill mt-2">
        <div className="row between"><span className="muted">Item total</span><span>\u20B9{store.totals.amount}</span></div>
        <div className="row between"><span className="muted">Taxes</span><span>Included</span></div>
        <div className="road" style={{ margin: '12px auto' }} />
        <div className="row between total"><strong>To pay</strong><strong className="amber-text">\u20B9{store.totals.amount}</strong></div>
      </div>

      <button className="btn btn-primary btn-block mt-3" onClick={() => setStage('pay')}>
        Proceed to pay \u20B9{store.totals.amount}
      </button>
      <button className="btn btn-ghost btn-block mt-1" onClick={goMenu}>Add more items</button>
    </div>
  )
}

function OrderPlaced({ goGames, goMenu }) {
  const store = useStore()
  const o = store.order
  const [eta, setEta] = useState(15 * 60)

  useEffect(() => {
    const t = setInterval(() => setEta(e => (e > 0 ? e - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const mm = String(Math.floor(eta / 60)).padStart(2, '0')
  const ss = String(eta % 60).padStart(2, '0')

  return (
    <div className="page-enter center">
      <div className="check-burst">\u2705</div>
      <h2 className="neon-text">Order placed!</h2>
      <p className="muted mt-1">Order <strong className="amber-text">#{o.id}</strong> \u2022 Table {o.table}</p>
      {store.paid && <p className="leaf mt-1">Payment received \u2022 \u20B9{o.amount}</p>}

      <div className="card mt-3" style={{ padding: 18, maxWidth: 420, margin: '18px auto' }}>
        <p className="muted">Cooking up your order \uD83D\uDC68\u200D\uD83C\uDF73</p>
        <div className="eta">{mm}:{ss}</div>
        <p className="muted" style={{ fontSize: 12 }}>estimated time remaining</p>
      </div>

      <div className="card mt-2" style={{ padding: 14, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
        {o.lines.map((l, i) => (
          <div className="row between" key={i} style={{ padding: '4px 0' }}>
            <span>{l.qty} \u00D7 {l.name}</span>
            <span className="muted">\u20B9{l.qty * l.price}</span>
          </div>
        ))}
      </div>

      <p className="amber-text mt-3" style={{ fontWeight: 600 }}>While you wait\u2026 play a game! \uD83C\uDFAE</p>
      <button className="btn btn-primary btn-block mt-2" style={{ maxWidth: 420, margin: '8px auto' }} onClick={goGames}>
        Play games
      </button>
      <button
        className="btn btn-ghost btn-block mt-1"
        style={{ maxWidth: 420, margin: '0 auto' }}
        onClick={() => { store.newSession(); goMenu(); }}
      >
        Start a new order
      </button>
    </div>
  )
}

/* ---------------- Bottom Nav ---------------- */
function BottomNav({ tab, setTab, count, hasOrder }) {
  return (
    <nav className="bottom-nav">
      <button className={tab === 'menu' ? 'active' : ''} onClick={() => setTab('menu')}>
        <span className="ic">\uD83C\uDF7D\uFE0F</span>Menu
      </button>
      <button className={tab === 'cart' ? 'active' : ''} onClick={() => setTab('cart')}>
        <span className="ic">\uD83D\uDED2</span>{hasOrder ? 'Order' : 'Cart'}
        {count > 0 && <span className="badge">{count}</span>}
      </button>
      <button className={tab === 'games' ? 'active' : ''} onClick={() => setTab('games')}>
        <span className="ic">\uD83C\uDFAE</span>Games
      </button>
    </nav>
  )
}
