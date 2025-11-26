/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.01em', fontWeight: '400' }],
                xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.01em', fontWeight: '500' }],
                '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.01em', fontWeight: '500' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.01em', fontWeight: '600' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.01em', fontWeight: '600' }],
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '700' }],
            },
            fontFamily: {
                heading: "Poppins-v2",
                paragraph: "Roboto"
            },
            colors: {
                accent: '#71D261',
                support: '#55C376',
                support2: '#25AA98',
                'muted-text': '#64748B',
                border: '#E5E7EB',
                'light-green': '#B7E5CE',
                destructive: '#FF4136',
                'destructive-foreground': '#FFFFFF',
                background: '#F6F8FB',
                secondary: '#3AB689',
                foreground: '#0B1220',
                'secondary-foreground': '#FFFFFF',
                'primary-foreground': '#FFFFFF',
                primary: '#0E9FA8'
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
