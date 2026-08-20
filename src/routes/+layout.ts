import { browser } from '$app/environment';
import { localePersistedState } from '$lib/state/locale.state.svelte.js';
import { loadLocale } from 'wuchale/load-utils';
import { locales } from '../locales/data.js';
import '../locales/js.loader.js';
import '../locales/main.loader.svelte.js';
import type { LayoutLoad } from './$types.js';

export const load: LayoutLoad = async ({ data }) => {
	const locale = localePersistedState.current ?? 'de';
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-expect-error
	if (browser && locales.includes(locale)) {
		await loadLocale(locale);
	}

	return data;
};
