import type { UserReadingState, ReadingStats } from "./types";

/** Count reading units: CJK characters plus whitespace-separated words. */
export function countReadingUnits(text: string): number {
	const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
	const western = text
		.replace(/[\u4e00-\u9fff]/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
	return cjk + western;
}

export function computeProgressFromLine(
	lineStart: number,
	totalLines: number,
): number {
	if (totalLines <= 1) return lineStart > 0 ? 1 : 0;
	return Math.max(0, Math.min(1, lineStart / (totalLines - 1)));
}

export function buildReadingStats(
	state: Partial<UserReadingState>,
	totalWords: number,
	wordsPerMinute: number,
): ReadingStats {
	const progress = clamp01(state.progress ?? 0);
	const read = Boolean(state.read);
	const wordsRead = read
		? totalWords
		: Math.round(totalWords * progress);
	const remainingUnits = Math.max(0, totalWords - wordsRead);
	const remainingMinutes =
		wordsPerMinute > 0
			? Math.max(1, Math.ceil(remainingUnits / wordsPerMinute))
			: 0;

	return {
		progress,
		totalWords,
		wordsRead,
		remainingMinutes: read ? 0 : remainingMinutes,
		read,
		finished: state.finished ?? null,
	};
}

export function formatProgressPercent(progress: number): string {
	return `${Math.round(clamp01(progress) * 100)}%`;
}

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}
