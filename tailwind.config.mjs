/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./node_modules/preline/preline.js',
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	theme: {
		extend: {
			fontFamily: {
				archivo: ["Archivo Black", "sans-serif"],
				manrope: ["Manrope", "sans-serif"],
				inter: ["Inter", "sans-serif"],
			},
			colors: {
				cream: "#F5F3EF",
				charcoal: "#2C2C2C",
				sage: {
					50: "#eef4f3",
					100: "#d6eae8",
					200: "#aaccca",
					300: "#7db5b0",
					400: "#5d9e98",
					500: "#468880",
					600: "#356d67",
					700: "#26524d",
					800: "#1a3835",
					900: "#0e1d1c",
				},
			},
		},
	},
	plugins: [require('preline/plugin')],
}
