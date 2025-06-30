import flowbitePlugin from 'flowbite/plugin';

import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	darkMode: 'selector',
	theme: {
		fontFamily: {
			body: ['Inter', 'sans-serif']
		},
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: '#e5f4ff',
					100: '#b3dfff',
					200: '#7fc7fd',
					300: '#4cb3fd',
					400: '#1a9efd',
					600: '#0084e4',
					500: '#0067b2',
					700: '#0062a9',
					800: '#002c4c',
					900: '#000f1a'
				},
				purple: {
					50: '#5b5fc7',
					100: '#5b5fc7',
					200: '#5b5fc7',
					300: '#5b5fc7',
					400: '#5b5fc7',
					500: '#5b5fc7',
					600: '#5b5fc7',
					700: '#5b5fc7',
					800: '#5b5fc7',
					900: '#5b5fc7'
				}
			}
		}
	},

	plugins: [flowbitePlugin]
} as Config;
