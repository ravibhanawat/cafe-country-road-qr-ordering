import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { qrToSVG } from '../lib/qrcode'

/* Renders a scannable UPI QR.
   Primary: the well-tested 'qrcode' library (drawn to a canvas).
   Fallback: the bundled dependency-free generator (SVG). */
export default function PaymentQR({ value, size = 230 }) {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!canvasRef.current) return
    QRCode.toCanvas(
      canvasRef.current,
      value,
      { width: size, margin: 2, color: { dark: '#0b1023', light: '#ffffff' } },
      (err) => { if (err && !cancelled) setFailed(true) }
    )
    return () => { cancelled = true }
  }, [value, size])

  if (failed) {
    let svg = null
    try { svg = qrToSVG(value, { size, margin: 3 }) } catch (e) { svg = null }
    if (svg) {
      return <div className="qr-frame" role="img" aria-label="Scan to pay with any UPI app"
        dangerouslySetInnerHTML={{ __html: svg }} />
    }
    return (
      <div className="qr-fallback">
        <p className="center">Open this UPI link in your payments app:</p>
        <p className="center" style={{ wordBreak: 'break-all', fontSize: 12 }}>{value}</p>
      </div>
    )
  }

  return (
    <div className="qr-frame">
      <canvas ref={canvasRef} width={size} height={size} aria-label="Scan to pay with any UPI app" />
    </div>
  )
}
