import { useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   Time-pass games to play while the kitchen prepares the order.
   Three lightweight, dependency-free games:
     1. Coffee Tic-Tac-Toe  (vs simple AI)
     2. Brew Memory Match   (flip & match the cafe icons)
     3. Catch the Beans     (tap falling coffee beans, beat the clock)
   ============================================================ */

export default function Games() {
  const [active, setActive] = useState(null)

  const games = [
    { id: 'ttt', name: 'Coffee Tic-Tac-Toe', icon: '\u2615', desc: 'Cup vs Leaf. Beat the barista bot!' },
    { id: 'memory', name: 'Brew Memory Match', icon: '\uD83C\uDCCF', desc: 'Flip the cards & match the pairs.' },
    { id: 'beans', name: 'Catch the Beans', icon: '\uD83E\uDED8', desc: 'Tap the falling beans before time runs out.' }
  ]

  if (active) {
    return (
      <div className="page-enter">
        <button className="btn btn-ghost" onClick={() => setActive(null)}>\u2190 Back to games</button>
        <div className="mt-2">
          {active === 'ttt' && <TicTacToe />}
          {active === 'memory' && <MemoryMatch />}
          {active === 'beans' && <CatchBeans />}
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <h2 className="neon-text center">Play while we brew \u2615</h2>
      <p className="muted center mt-1">Good food takes a little time. Pass it with a game!</p>
      <div className="game-grid mt-3">
        {games.map(g => (
          <button key={g.id} className="card game-card" onClick={() => setActive(g.id)}>
            <span className="game-ic">{g.icon}</span>
            <strong>{g.name}</strong>
            <span className="muted">{g.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- 1. Tic-Tac-Toe ---------------- */
function TicTacToe() {
  const HUMAN = '\u2615', BOT = '\uD83C\uDF43'
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(HUMAN)
  const winner = useMemo(() => calcWinner(board), [board])
  const full = board.every(Boolean)

  useEffect(() => {
    if (turn === BOT && !winner && !full) {
      const t = setTimeout(() => {
        const move = bestMove(board, BOT, HUMAN)
        if (move != null) {
          const nb = board.slice(); nb[move] = BOT
          setBoard(nb); setTurn(HUMAN)
        }
      }, 450)
      return () => clearTimeout(t)
    }
  }, [turn, board, winner, full])

  function play(i) {
    if (board[i] || winner || turn !== HUMAN) return
    const nb = board.slice(); nb[i] = HUMAN
    setBoard(nb); setTurn(BOT)
  }
  function reset() { setBoard(Array(9).fill(null)); setTurn(HUMAN) }

  const status = winner
    ? (winner === HUMAN ? 'You win! \uD83C\uDF89' : 'Barista bot wins \uD83E\uDD16')
    : full ? "It's a draw \uD83E\uDD1D" : (turn === HUMAN ? 'Your turn (\u2615)' : 'Bot thinking\u2026')

  return (
    <div className="card game-board center">
      <h3 className="amber-text">Coffee Tic-Tac-Toe</h3>
      <p className="muted mt-1">{status}</p>
      <div className="ttt mt-2">
        {board.map((c, i) => (
          <button key={i} className="ttt-cell" onClick={() => play(i)}>{c}</button>
        ))}
      </div>
      <button className="btn btn-primary mt-2" onClick={reset}>New game</button>
    </div>
  )
}
function calcWinner(b) {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (const [a,c,d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  return null
}
function bestMove(b, bot, human) {
  const empty = b.map((v,i)=>v?null:i).filter(v=>v!=null)
  for (const i of empty) { const t=b.slice(); t[i]=bot; if (calcWinner(t)===bot) return i }
  for (const i of empty) { const t=b.slice(); t[i]=human; if (calcWinner(t)===human) return i }
  if (b[4]==null) return 4
  const corners = [0,2,6,8].filter(i=>b[i]==null)
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)]
  return empty[Math.floor(Math.random()*empty.length)]
}

/* ---------------- 2. Memory Match ---------------- */
function MemoryMatch() {
  const ICONS = ['\u2615','\uD83C\uDF55','\uD83C\uDF70','\uD83E\uDD64','\uD83C\uDF54','\uD83C\uDF5F']
  const [deck, setDeck] = useState(() => shuffleDeck(ICONS))
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const won = matched.length === deck.length

  function flip(i) {
    if (flipped.includes(i) || matched.includes(i) || flipped.length === 2) return
    const nf = [...flipped, i]
    setFlipped(nf)
    if (nf.length === 2) {
      setMoves(m => m + 1)
      const [a,c] = nf
      if (deck[a] === deck[c]) {
        setTimeout(() => { setMatched(m => [...m, a, c]); setFlipped([]) }, 500)
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }
  function reset() { setDeck(shuffleDeck(ICONS)); setFlipped([]); setMatched([]); setMoves(0) }

  return (
    <div className="card game-board center">
      <h3 className="amber-text">Brew Memory Match</h3>
      <p className="muted mt-1">{won ? 'Solved in ' + moves + ' moves! \uD83C\uDF89' : 'Moves: ' + moves}</p>
      <div className="memory mt-2">
        {deck.map((ic, i) => {
          const show = flipped.includes(i) || matched.includes(i)
          return (
            <button key={i} className={'mem-card' + (show ? ' open' : '')} onClick={() => flip(i)}>
              <span>{show ? ic : '\u2753'}</span>
            </button>
          )
        })}
      </div>
      <button className="btn btn-primary mt-2" onClick={reset}>Shuffle & restart</button>
    </div>
  )
}
function shuffleDeck(icons) {
  const d = [...icons, ...icons]
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]] }
  return d
}

/* ---------------- 3. Catch the Beans ---------------- */
function CatchBeans() {
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(20)
  const [beans, setBeans] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    if (!running) return
    const spawn = setInterval(() => {
      setBeans(b => [...b, { id: idRef.current++, x: Math.random()*82 + 4, y: -8, kind: Math.random() < 0.18 ? 'bad' : 'good' }])
    }, 620)
    const fall = setInterval(() => {
      setBeans(b => b.map(o => ({ ...o, y: o.y + 6 })).filter(o => o.y < 108))
    }, 90)
    const clock = setInterval(() => setTime(t => t - 1), 1000)
    return () => { clearInterval(spawn); clearInterval(fall); clearInterval(clock) }
  }, [running])

  useEffect(() => {
    if (time <= 0 && running) { setRunning(false); setBeans([]) }
  }, [time, running])

  function start() { setScore(0); setTime(20); setBeans([]); setRunning(true) }
  function tap(b) {
    if (!running) return
    setBeans(arr => arr.filter(o => o.id !== b.id))
    setScore(s => s + (b.kind === 'bad' ? -2 : 1))
  }

  return (
    <div className="card game-board center">
      <h3 className="amber-text">Catch the Beans</h3>
      <p className="muted mt-1">{running ? 'Time: ' + time + 's \u2022 Score: ' + score : (time <= 0 ? 'Final score: ' + score + ' \u2615' : 'Tap good beans, avoid chillies!')}</p>
      <div className="catch-area mt-2">
        {beans.map(b => (
          <button
            key={b.id}
            className="bean"
            style={{ left: b.x + '%', top: b.y + '%' }}
            onClick={() => tap(b)}
          >{b.kind === 'bad' ? '\uD83C\uDF36\uFE0F' : '\uD83E\uDED8'}</button>
        ))}
        {!running && (
          <button className="btn btn-primary catch-start" onClick={start}>
            {time <= 0 ? 'Play again' : 'Start'}
          </button>
        )}
      </div>
    </div>
  )
}
