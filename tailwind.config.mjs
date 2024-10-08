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
			},
		},
	},
	plugins: [require('preline/plugin')],
}
