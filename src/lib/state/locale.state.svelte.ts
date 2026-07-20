import { browser } from '$app/environment';

const COOKIE_NAME = 'locale';

function readCookie(): string | undefined {
	return document.cookie
		.split('; ')
		.find((c) => c.startsWith(`${COOKIE_NAME}=`))
		?.split('=')[1];
}

class LocaleState {
	#current = $state(browser ? (readCookie() ?? 'de') : 'de');

	get current() {
		return this.#current;
	}

	set current(value: string) {
		this.#current = value;
		if (browser) {
			document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
		}
	}
}

export const localePersistedState = new LocaleState();
