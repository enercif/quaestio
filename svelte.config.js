import adapter from 'svelte-adapter-uws';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
		experimental: {
			async: true
		}
	},
	kit: {
		adapter: adapter({
			websocket: {
				allowedOrigins: [
					'https://dev.quaestio.enercif.de',
					'http://localhost:5173',
					'http://localhost:3000'
				]
			}
		}),
		typescript: {
			config: (config) => ({
				...config,
				include: [...config.include, '../drizzle.config.ts']
			})
		},
		experimental: {
			remoteFunctions: true
		}
	}
};

export default config;
