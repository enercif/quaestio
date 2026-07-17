import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

type RemoveNull<T> = T extends null
	? never
	: T extends object
		? { [K in keyof T]: RemoveNull<T[K]> }
		: T extends (infer U)[]
			? RemoveNull<U>[]
			: T;

export const removeNull = <T>(obj: T): RemoveNull<T> => {
	if (Array.isArray(obj)) {
		return obj.filter((item) => item !== null).map((item) => removeNull(item)) as RemoveNull<T>;
	}

	if (obj !== null && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj)
				.filter(([, value]) => value !== null)
				.map(([key, value]) => [key, removeNull(value)])
		) as RemoveNull<T>;
	}

	return obj as RemoveNull<T>;
};

export function getInitials(name: string | null | undefined): string {
	if (!name) return '??';

	return name
		.split(' ')
		.map((c) => c[0])
		.join('')
		.slice(0, 2)
		.toLocaleUpperCase();
}
