import { forwardRef } from 'react'

/**
 * A ledger entry field: printed-form label above a plain rule, not a
 * heavy rounded box — the way a registration form in a mandi office
 * prints a label and leaves a line to write on.
 */
const Field = forwardRef(function Field(
  { label, id, type = 'text', trailing, className = '', ...props },
  ref
) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1.5 block font-ledger text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
        {label}
      </span>
      <div className="flex items-center gap-2 border-b-2 border-ink/25 pb-2 transition-colors focus-within:border-maroon">
        <input
          ref={ref}
          id={id}
          type={type}
          className="w-full bg-transparent font-body text-base text-ink placeholder:text-ink/35 focus:outline-none"
          {...props}
        />
        {trailing}
      </div>
    </label>
  )
})

export default Field
