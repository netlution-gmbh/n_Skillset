import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { svelteTesting } from '@testing-library/svelte/vite';
import path from 'path';

export default defineConfig({
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
	plugins: [sveltekit(), svelteTesting()],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./src/test/setup.ts'],
		deps: {
			inline: ['flowbite-svelte', 'flowbite-svelte-icons']
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['**/node_modules/**', '**/dist/**', '**/.svelte-kit/**']
		}
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$app: path.resolve('./node_modules/@sveltejs/kit/src/runtime/app'),
			'flowbite-svelte': path.resolve('./node_modules/flowbite-svelte/dist/index.js'),
			'flowbite-svelte-icons': path.resolve('./node_modules/flowbite-svelte-icons/dist/index.js')
		},
		dedupe: ['svelte']
	},
	optimizeDeps: {
		include: ['flowbite-svelte', 'flowbite-svelte-icons'],
		exclude: []
	},
	build: {
		commonjsOptions: {
			include: [/flowbite-svelte/, /flowbite-svelte-icons/, /node_modules/]
		}
	}
});
