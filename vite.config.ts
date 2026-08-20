import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import uws from 'svelte-adapter-uws/vite';
import realtime from 'svelte-realtime/vite';
import { defineConfig } from 'vite';
import { wuchale } from 'wuchale/vite';

export default defineConfig({
	plugins: [tailwindcss(), wuchale(), sveltekit(), uws(), realtime()]
});
