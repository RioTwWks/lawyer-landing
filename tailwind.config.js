/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        /* Строгая юридическая палитра — правьте здесь или через CSS-переменные */
        navy: {
          950: 'var(--color-navy-950)',
          900: 'var(--color-navy-900)',
          800: 'var(--color-navy-800)',
          700: 'var(--color-navy-700)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
          soft: 'var(--color-ink-soft)',
        },
        paper: {
          DEFAULT: 'var(--color-paper)',
          warm: 'var(--color-paper-warm)',
        },
        bronze: {
          DEFAULT: 'var(--color-bronze)',
          light: 'var(--color-bronze-light)',
          dark: 'var(--color-bronze-dark)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.25rem, 5vw + 1rem, 3.75rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'brand': ['clamp(1.75rem, 3vw + 0.5rem, 2.5rem)', { lineHeight: '1.15', letterSpacing: '0.02em' }],
      },
      maxWidth: {
        content: '72rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
