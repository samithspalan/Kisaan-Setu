/**
 * The mandi board: today's prices set the way a market bulletin
 * board or ledger printout would set them — ruled rows, right-aligned
 * tabular figures, trend read as a direction rather than a color chip.
 */
export default function LedgerTable({ columns, rows, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-ink">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-3 py-2 font-ledger text-[11px] font-semibold tracking-[0.12em] text-ink/70 uppercase ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-ink/10 last:border-b-0 hover:bg-ink/[0.03]">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2.5 text-sm ${col.mono !== false ? 'font-ledger tabular-nums' : 'font-body'} ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
