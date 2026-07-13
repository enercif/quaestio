import type { SequenceType } from '$lib/schemas/question.schema';

export function indexToSequence(index: number, type: SequenceType) {
	switch (type) {
		case 'numeric':
			return (index + 1).toString();
		case 'roman':
			return toRoman(index + 1);
		case 'alphabetic':
			return String.fromCharCode(65 + index);
	}

	function toRoman(num: number): string {
		if (num <= 0 || num > 3999) throw new RangeError('Number must be between 1 and 3999');

		const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
		const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

		let result = '';
		for (let i = 0; i < values.length; i++) {
			while (num >= values[i]) {
				result += symbols[i];
				num -= values[i];
			}
		}
		return result;
	}
}
