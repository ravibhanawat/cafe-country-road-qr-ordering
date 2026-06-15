import { useMemo } from 'react'
import { qrToSVG } from '../lib/qrcode'

/* Renders a scannable UPI QR. Tries the bundled generator first;
   if anything goes wrong it shows a graceful fallback message. */
export default function PaymentQR({ value, size = 230 }) {
  const svg = useMemo(() => {
    try {
      return qrToSVG(value, { size, margin: 3, dark: '#0b1023', light: '#ffffff' })
    } catch (e) {
      return null
    }
  }, [value, size])

  if (!svg) {
    return (
      <div className="qr-fallback">
        <p className="muted center">Couldn't render the QR here.</p>
        <p className="center" style={{ wordBreak: 'break-all', fontSize: 12 }}>{value}</p>
      </div>
    )
  }

  return (
    <div
      className="qr-frame"
      role="img"
      aria-label="Scan to pay with any UPI app"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
