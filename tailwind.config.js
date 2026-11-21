/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './Components/**/*.{razor,html}',
        './wwwroot/**/*.html'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                navy: {
                    950: '#0D101E',
                    900: '#121526',
                    800: '#1A1E35',
                    700: '#242A4A',
                },
                brand: {
                    cyan: '#00D2FF',
                    magenta: '#D946EF',
                    mint: '#2DD4BF',
                }
            },
            boxShadow: {
                'glow-cyan': '0 0 25px -5px rgba(0, 210, 255, 0.35)',
                'glow-magenta': '0 0 25px -5px rgba(217, 70, 239, 0.35)',
            }
        }
    },
    plugins: []
};
