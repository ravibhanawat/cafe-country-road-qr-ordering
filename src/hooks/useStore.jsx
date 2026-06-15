import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

/* ------------------------------------------------------------------
   Global store: handles the locked table number + cart + order state.
   The table number is read ONCE from the URL (?table=NN) and then
   locked for the whole session. A guest can ONLY order for their own
   table - they cannot change it from inside the app.
------------------------------------------------------------------ */

const StoreContext = createContext(null)

function readTableFromURL() {
  const params = new URLSearchParams(window.location.search)
  let t = params.get('table') || params.get('t')
  if (!t) {
    // also support hash style #table=5
    const h = new URLSearchParams(window.location.hash.replace('#', ''))
    t = h.get('table')
  }
  if (!t) return null
  const n = parseInt(String(t).replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

const initialState = {
  table: readTableFromURL(),   // null => no valid table => blocked
  cart: {},                    // { itemId: { item, qty } }
  order: null,                 // placed order object
  paid: false
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const ex = state.cart[action.item.id]
      const qty = (ex?.qty || 0) + 1
      return { ...state, cart: { ...state.cart, [action.item.id]: { item: action.item, qty } } }
    }
    case 'DEC': {
      const ex = state.cart[action.id]
      if (!ex) return state
      const qty = ex.qty - 1
      const cart = { ...state.cart }
      if (qty <= 0) delete cart[action.id]
      else cart[action.id] = { ...ex, qty }
      return { ...state, cart }
    }
    case 'REMOVE': {
      const cart = { ...state.cart }
      delete cart[action.id]
      return { ...state, cart }
    }
    case 'CLEAR':
      return { ...state, cart: {} }
    case 'PLACE_ORDER':
      return { ...state, order: action.order }
    case 'MARK_PAID':
      return { ...state, paid: true }
    case 'NEW_SESSION':
      return { ...state, cart: {}, order: null, paid: false }
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // persist cart per table so a refresh keeps the order
  useEffect(() => {
    if (!state.table) return
    localStorage.setItem('ccr_cart_' + state.table, JSON.stringify(state.cart))
  }, [state.cart, state.table])

  const totals = useMemo(() => {
    const lines = Object.values(state.cart)
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const amount = lines.reduce((s, l) => s + l.qty * l.item.price, 0)
    return { count, amount, lines }
  }, [state.cart])

  const api = {
    ...state,
    totals,
    add: (item) => dispatch({ type: 'ADD', item }),
    dec: (id) => dispatch({ type: 'DEC', id }),
    remove: (id) => dispatch({ type: 'REMOVE', id }),
    clear: () => dispatch({ type: 'CLEAR' }),
    qtyOf: (id) => state.cart[id]?.qty || 0,
    placeOrder: () => {
      const order = {
        id: 'CCR' + Date.now().toString().slice(-6),
        table: state.table,
        lines: totals.lines.map(l => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
        amount: totals.amount,
        placedAt: new Date().toISOString()
      }
      dispatch({ type: 'PLACE_ORDER', order })
      return order
    },
    markPaid: () => dispatch({ type: 'MARK_PAID' }),
    newSession: () => dispatch({ type: 'NEW_SESSION' })
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
