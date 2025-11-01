export const fmtPct = (n: number) => `${n.toFixed(1)}%`
export const fmtNum = (n: number) => new Intl.NumberFormat().format(n)