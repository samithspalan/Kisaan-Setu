const variants = {
  primary: 'bg-maroon text-paper hover:bg-maroon-dark focus-visible:outline-maroon',
  brass: 'bg-brass text-ink hover:bg-brass-light focus-visible:outline-brass',
  outline: 'bg-transparent text-ink border border-ink/30 hover:border-ink focus-visible:outline-ink',
  ghost: 'bg-transparent text-paper hover:bg-paper/10 focus-visible:outline-paper',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 font-body text-sm font-semibold tracking-wide transition-colors duration-150 outline-offset-2 focus-visible:outline focus-visible:outline-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
