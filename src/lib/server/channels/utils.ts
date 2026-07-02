type Resolver = () => void;

const channels = new Map<string, Set<Resolver>>();

export function notify(...names: string[]) {
	for (const name of names) {
		const subs = channels.get(name);
		if (!subs) continue;
		channels.delete(name);
		for (const resolve of subs) resolve();
	}
}

export async function once(name: string, timeoutMs?: number): Promise<void> {
	const { promise, resolve } = Promise.withResolvers<void>();

	let subs = channels.get(name);
	if (!subs) channels.set(name, (subs = new Set()));
	subs.add(resolve);

	const timeout = timeoutMs !== undefined ? setTimeout(resolve, timeoutMs) : undefined;

	return promise.finally(() => {
		if (timeout !== undefined) clearTimeout(timeout);
		subs.delete(resolve);
		if (subs.size === 0 && channels.get(name) === subs) channels.delete(name);
	});
}
