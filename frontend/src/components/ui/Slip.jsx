/**
 * A "weighing slip" card — the receipt a farmer gets handed at the
 * mandi after produce is weighed. Used for individual listings.
 */
export default function Slip({ className = '', children, ...props }) {
  return (
    <div
      className={`slip-edge relative border border-ink/15 bg-paper shadow-[0_1px_0_rgba(36,28,21,0.08)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[repeating-linear-gradient(90deg,var(--color-rule)_0,var(--color-rule)_6px,transparent_6px,transparent_12px)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
