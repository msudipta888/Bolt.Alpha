// tailwind.config.js
export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    // Only basic theme extensions here
    extend: {
      // We'll keep color references to CSS variables
      colors: {
        neon: {
          blue: 'hsl(var(--neon-blue))',
          purple: 'hsl(var(--neon-purple))',
          cyan: 'hsl(var(--neon-cyan))',
          pink: 'hsl(var(--neon-pink))',
          green: 'hsl(var(--neon-green))'
        }
      }
    }
  },
  plugins: []
}