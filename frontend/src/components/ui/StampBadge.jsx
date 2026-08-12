/**
 * The signature element: an ink-stamp seal marking data as coming
 * from the official government mandi price feed (data.gov.in) —
 * the one real trust claim the product makes, made visible.
 */
export default function StampBadge({ label = 'VERIFIED', sublabel = 'GOVT. SOURCE', className = '' }) {
  return (
    <div
      className={`ink-stamp h-20 w-20 shrink-0 flex-col text-rule ${className}`}
      role="img"
      aria-label={`${label} ${sublabel}`}
    >
      <span className="text-[10px] font-bold leading-tight">{label}</span>
      <span className="text-[7px] leading-tight opacity-80">{sublabel}</span>
    </div>
  )
}
