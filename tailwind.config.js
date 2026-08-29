/** Mirrors the tokens that were inline on the CDN build, 1:1 with the
 *  Visual & Verbal World palette. No ad hoc hex values anywhere else.
 *  @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        ink:    '#0B0B0C',
        paper:  '#F7F6F2',
        signal: '#00D67D',
        slate:  '#6E7078',
        bg:     'var(--bg)',
        fg:     'var(--fg)',
        muted:  'var(--muted)',
        line:   'var(--line)',
      },
      fontFamily: {
        sans: ['"General Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { meta: '0.14em' },
    },
  },
  plugins: [],
};
