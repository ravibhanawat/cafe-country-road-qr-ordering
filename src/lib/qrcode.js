/* ------------------------------------------------------------------
   Minimal, dependency-free QR Code generator (byte mode).
   Based on the public QR spec; supports versions 1-10, ECC level M.
   Returns a square boolean matrix (true = dark module).
   Plenty large enough for UPI payment strings.
------------------------------------------------------------------ */

// Galois field tables for Reed-Solomon
const EXP = new Array(512), LOG = new Array(256)
;(function initGF() {
  let x = 1
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
})()

function rsGenerator(n) {
  let poly = [1]
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gmul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}
function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]] }

function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen)
  const res = new Array(ecLen).fill(0)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0]
    res.shift(); res.push(0)
    if (factor !== 0) for (let j = 0; j < gen.length; j++) res[j] ^= gmul(gen[j], factor)
  }
  // note: above shift loses alignment; use robust version below
  return res
}

// Robust RS using running remainder
function rsEncodeBlock(data, ecLen) {
  const gen = rsGenerator(ecLen)
  const buf = data.concat(new Array(ecLen).fill(0))
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i]
    if (coef !== 0) for (let j = 0; j < gen.length; j++) buf[i + j] ^= gmul(gen[j], coef)
  }
  return buf.slice(data.length)
}

// Capacity / ECC params for level M, versions 1..10 (byte mode data capacity in bytes)
// [version]: { size, ecPerBlock, group1Blocks, group1Data, group2Blocks, group2Data }
const VERS = {
  1:  { ec: 10, g1b: 1, g1d: 16, g2b: 0, g2d: 0 },
  2:  { ec: 16, g1b: 1, g1d: 28, g2b: 0, g2d: 0 },
  3:  { ec: 26, g1b: 1, g1d: 44, g2b: 0, g2d: 0 },
  4:  { ec: 18, g1b: 2, g1d: 32, g2b: 0, g2d: 0 },
  5:  { ec: 24, g1b: 2, g1d: 43, g2b: 0, g2d: 0 },
  6:  { ec: 16, g1b: 4, g1d: 27, g2b: 0, g2d: 0 },
  7:  { ec: 18, g1b: 4, g1d: 31, g2b: 0, g2d: 0 },
  8:  { ec: 22, g1b: 2, g1d: 38, g2b: 2, g2d: 39 },
  9:  { ec: 22, g1b: 3, g1d: 36, g2b: 2, g2d: 37 },
  10: { ec: 26, g1b: 4, g1d: 43, g2b: 1, g2d: 44 }
}
const ALIGN = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
}

function dataCapacity(v) { const p = VERS[v]; return p.g1b * p.g1d + p.g2b * p.g2d }

function pickVersion(byteLen) {
  for (let v = 1; v <= 10; v++) {
    // overhead: 4 (mode) + 8 or 16 (count) bits => use 16 for v>=10 byte count
    const countBits = v < 10 ? 8 : 16
    const need = 4 + countBits + byteLen * 8
    const cap = dataCapacity(v) * 8
    if (need <= cap) return v
  }
  throw new Error('Data too long for QR (max version 10)')
}

function strToBytes(str) {
  const out = []
  for (const ch of str) {
    let c = ch.codePointAt(0)
    if (c < 0x80) out.push(c)
    else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)) }
    else if (c < 0x10000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)) }
    else { out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)) }
  }
  return out
}

function buildBitstream(bytes, v) {
  const bits = []
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1) }
  push(0b0100, 4) // byte mode
  push(bytes.length, v < 10 ? 8 : 16)
  for (const b of bytes) push(b, 8)
  const cap = dataCapacity(v) * 8
  // terminator
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)
  // pad bytes
  const pads = [0xec, 0x11]; let pi = 0
  while (bits.length < cap) { push(pads[pi % 2], 8); pi++ }
  // to bytes
  const out = []
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]
    out.push(b)
  }
  return out
}

function interleave(dataBytes, v) {
  const p = VERS[v]
  const blocks = []
  let idx = 0
  for (let i = 0; i < p.g1b; i++) { const d = dataBytes.slice(idx, idx + p.g1d); idx += p.g1d; blocks.push({ d, ec: rsEncodeBlock(d, p.ec) }) }
  for (let i = 0; i < p.g2b; i++) { const d = dataBytes.slice(idx, idx + p.g2d); idx += p.g2d; blocks.push({ d, ec: rsEncodeBlock(d, p.ec) }) }
  const maxD = Math.max(...blocks.map(b => b.d.length))
  const res = []
  for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.d.length) res.push(b.d[i])
  for (let i = 0; i < p.ec; i++) for (const b of blocks) res.push(b.ec[i])
  return res
}

function makeMatrix(v) {
  const size = v * 4 + 17
  const m = Array.from({ length: size }, () => new Array(size).fill(null))
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false))
  const setF = (r, c, val) => { m[r][c] = val ? 1 : 0; reserved[r][c] = true }

  function finder(r, c) {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const rr = r + i, cc = c + j
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue
      const inRing = (i >= 0 && i <= 6 && (j === 0 || j === 6)) || (j >= 0 && j <= 6 && (i === 0 || i === 6))
      const inCore = i >= 2 && i <= 4 && j >= 2 && j <= 4
      setF(rr, cc, inRing || inCore)
    }
  }
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0)

  // timing
  for (let i = 8; i < size - 8; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0) }

  // alignment
  const ap = ALIGN[v]
  for (const r of ap) for (const c of ap) {
    if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const ring = Math.max(Math.abs(i), Math.abs(j))
      setF(r + i, c + j, ring !== 1)
    }
  }

  // dark module
  setF(size - 8, 8, true)

  // reserve format areas
  for (let i = 0; i < 9; i++) { if (!reserved[8][i]) reserved[8][i] = true; if (!reserved[i][8]) reserved[i][8] = true }
  for (let i = 0; i < 8; i++) { reserved[8][size - 1 - i] = true; reserved[size - 1 - i][8] = true }

  return { m, reserved, size }
}

function placeData(state, bytes) {
  const { m, reserved, size } = state
  const bits = []
  for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  let bi = 0, up = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5
    for (let n = 0; n < size; n++) {
      const row = up ? size - 1 - n : n
      for (let c = 0; c < 2; c++) {
        const cc = col - c
        if (!reserved[row][cc]) { m[row][cc] = bi < bits.length ? bits[bi++] : 0 }
      }
    }
    up = !up
  }
}

function applyMask(state, mask) {
  const { m, reserved, size } = state
  const out = m.map(r => r.slice())
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (reserved[r][c]) continue
    let flip = false
    switch (mask) {
      case 0: flip = (r + c) % 2 === 0; break
      case 1: flip = r % 2 === 0; break
      case 2: flip = c % 3 === 0; break
      case 3: flip = (r + c) % 3 === 0; break
      case 4: flip = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break
      case 5: flip = ((r * c) % 2) + ((r * c) % 3) === 0; break
      case 6: flip = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; break
      case 7: flip = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; break
    }
    if (flip) out[r][c] ^= 1
  }
  return out
}

// Format info (ECC level M = 0b00) with mask, BCH 15,5
function formatBits(mask) {
  const data = (0b00 << 3) | mask // level M
  let v = data << 10
  const g = 0b10100110111
  for (let i = 4; i >= 0; i--) if ((v >> (i + 10)) & 1) v ^= g << i
  let bits = ((data << 10) | (v & 0x3ff)) ^ 0b101010000010010
  return bits & 0x7fff
}

function placeFormat(grid, mask, size) {
  const f = formatBits(mask)
  const bit = i => (f >> i) & 1
  // around top-left
  for (let i = 0; i <= 5; i++) grid[8][i] = bit(i)
  grid[8][7] = bit(6); grid[8][8] = bit(7); grid[7][8] = bit(8)
  for (let i = 9; i <= 14; i++) grid[14 - i][8] = bit(i)
  // around the other two finders
  for (let i = 0; i <= 7; i++) grid[size - 1 - i][8] = bit(i)
  for (let i = 8; i <= 14; i++) grid[8][size - 15 + i] = bit(i)
  grid[size - 8][8] = 1 // dark module already
}

function penalty(grid, size) {
  let p = 0
  // rule 1: runs
  for (let r = 0; r < size; r++) {
    let run = 1
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p += 1 }
      else run = 1
    }
  }
  for (let c = 0; c < size; c++) {
    let run = 1
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === grid[r - 1][c]) { run++; if (run === 5) p += 3; else if (run > 5) p += 1 }
      else run = 1
    }
  }
  return p
}

export function generateQR(text) {
  const bytes = strToBytes(text)
  const v = pickVersion(bytes.length)
  const stream = buildBitstream(bytes, v)
  const inter = interleave(stream, v)
  const state = makeMatrix(v)
  placeData(state, inter)

  let best = null, bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    const grid = applyMask(state, mask)
    placeFormat(grid, mask, state.size)
    const score = penalty(grid, state.size)
    if (score < bestScore) { bestScore = score; best = grid }
  }
  return best.map(row => row.map(v => v === 1))
}

export function qrToSVG(text, { size = 256, margin = 4, dark = '#0b1023', light = '#ffffff' } = {}) {
  const matrix = generateQR(text)
  const n = matrix.length
  const total = n + margin * 2
  const cell = size / total
  let rects = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (matrix[r][c]) {
      const x = (c + margin) * cell, y = (r + margin) * cell
      rects += '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + (cell + 0.5).toFixed(2) + '" height="' + (cell + 0.5).toFixed(2) + '"/>'
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
    '<rect width="100%" height="100%" fill="' + light + '"/><g fill="' + dark + '">' + rects + '</g></svg>'
}
