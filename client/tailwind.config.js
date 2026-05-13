/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#414A88',
        snDark: '#1F1935',
        snBlack: '#1B1B1B',
        accent: '#9199D8',
        sidebar: '#313767',
        muted: '#767676',
        snText: '#EFEFEF',
      },
      backgroundImage: {
        'sn-gradient':
          'radial-gradient(circle at 100% 50%, #7D85CB 0%, #5863BA 45%, #414A88 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
