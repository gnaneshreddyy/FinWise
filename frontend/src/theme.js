// Hex values for libraries (recharts) that cannot read Tailwind classes.
// Keep in sync with the @theme block in index.css.
export const colors = {
  canvas: '#0b0d10',
  surface: '#12151a',
  raised: '#1a1e25',
  line: '#262b33',
  lineStrong: '#353b45',
  ink: '#eceef1',
  inkMuted: '#a3a9b3',
  inkSubtle: '#6b727d',
  accent: '#e8b04b',
  gain: '#3fbf8a',
  loss: '#e5675b',
  warn: '#e8894b',
};

// Categorical series for charts: muted, distinguishable on the dark canvas.
export const chartSeries = ['#e8b04b', '#5fa8d3', '#9b8ae0', '#4fb3a0', '#d97a6c', '#c9a0dc', '#8a96a6'];

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: colors.raised,
    border: `1px solid ${colors.line}`,
    borderRadius: '8px',
    color: colors.ink,
  },
  itemStyle: { color: colors.ink },
  labelStyle: { color: colors.inkMuted },
};

export const chartAxisTick = { fontSize: 12, fill: colors.inkSubtle };
export const chartGridStroke = colors.line;
