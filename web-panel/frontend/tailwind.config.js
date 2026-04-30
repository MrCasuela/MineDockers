export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        minecraft: {
          dirt: '#8B4513',
          grass: '#7CB342',
          stone: '#8A8A8A',
          water: '#1E90FF',
          diamond: '#00E5FF',
        }
      }
    },
  },
  plugins: [],
}
