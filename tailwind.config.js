/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors restricted strictly to 4 colors
        'brand-orange': '#E65C38',
        'brand-orange-dark': '#C44521',
        'brand-orange-darker': '#A63A1C',
        'brand-orange-light': '#FFFFFF',
        'brand-green': '#305280',
        'brand-navy': '#305280',
        'brand-light-blue': '#305280',
        'brand-gold': '#FFCD1E',
        
        // Neutral colors
        'warm-white': '#FFFFFF',
        'warm-light': '#FFFFFF',
        'muted': '#305280',
        'near-black': '#305280',
        
        // Process background mapped to Navy
        'process-bg': '#305280',
      },
      fontFamily: {
        'heading': ['var(--font-maven-pro)', 'var(--font-noto-kannada)', 'var(--font-noto-devanagari)', 'Calibri', 'system-ui', 'sans-serif'],
        'body': ['var(--font-maven-pro)', 'var(--font-noto-kannada)', 'var(--font-noto-devanagari)', 'Calibri', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}