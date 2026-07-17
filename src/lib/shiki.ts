import { createHighlighter, type Highlighter } from 'shiki';

export const programmingLanguages = [
	{ value: 'java', label: 'Java' },
	{ value: 'python', label: 'Python' },
	{ value: 'c', label: 'C' },
	{ value: 'cpp', label: 'C++' },
	{ value: 'csharp', label: 'C#' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'typescript', label: 'TypeScript' }
];

const shikiThemes = { light: 'github-light', dark: 'github-dark' } as const;

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
	highlighter ??= createHighlighter({
		themes: Object.values(shikiThemes),
		langs: programmingLanguages.map((language) => language.value)
	});
	return highlighter;
}

export async function highlightCode(code: string, lang: string) {
	const shiki = await getHighlighter();
	return shiki.codeToHtml(code, {
		lang,
		themes: shikiThemes,
		transformers: [
			{
				line(node, line) {
					node.properties['data-line'] = line;
				}
			}
		]
	});
}
