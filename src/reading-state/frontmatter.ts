import { MarkdownView, TFile } from "obsidian";
import ReadingViewEnhancer from "src/main";
import {
	BSR_FRONTMATTER_KEY,
	DEFAULT_USER_READING_STATE,
	type UserReadingState,
} from "./types";
import { computeProgressFromLine, countReadingUnits } from "./stats";

export function getUserId(plugin: ReadingViewEnhancer): string {
	const id = plugin.settings.userId.trim();
	return id.length > 0 ? id : "default";
}

export function readUserStateFromCache(
	plugin: ReadingViewEnhancer,
	file: TFile,
): UserReadingState | null {
	const cache = plugin.app.metadataCache.getFileCache(file);
	const bsr = cache?.frontmatter?.[BSR_FRONTMATTER_KEY];
	if (!bsr || typeof bsr !== "object") return null;

	const userId = getUserId(plugin);
	const raw = (bsr as Record<string, unknown>)[userId];
	if (!raw || typeof raw !== "object") return null;

	return normalizeUserState(raw as Record<string, unknown>);
}

export async function writeUserState(
	plugin: ReadingViewEnhancer,
	file: TFile,
	patch: Partial<UserReadingState>,
): Promise<void> {
	const userId = getUserId(plugin);

	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		if (!frontmatter[BSR_FRONTMATTER_KEY]) {
			frontmatter[BSR_FRONTMATTER_KEY] = {};
		}

		const bsr = frontmatter[BSR_FRONTMATTER_KEY] as Record<
			string,
			Record<string, unknown>
		>;
		const current = normalizeUserState(bsr[userId] ?? {});
		bsr[userId] = { ...current, ...patch, updatedAt: Date.now() };
	});
}

export async function markAsRead(
	plugin: ReadingViewEnhancer,
	file: TFile,
	totalWords: number,
): Promise<void> {
	await writeUserState(plugin, file, {
		read: true,
		finished: new Date().toISOString().slice(0, 10),
		progress: 1,
		totalWords,
		wordsRead: totalWords,
	});
}

export async function markAsUnread(
	plugin: ReadingViewEnhancer,
	file: TFile,
): Promise<void> {
	await writeUserState(plugin, file, {
		read: false,
		finished: null,
	});
}

export async function getFileText(
	plugin: ReadingViewEnhancer,
	file: TFile,
): Promise<string> {
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (view?.file?.path === file.path) {
		return view.editor.getValue();
	}
	return plugin.app.vault.read(file);
}

export async function getFileReadingUnitsAsync(
	plugin: ReadingViewEnhancer,
	file: TFile,
): Promise<number> {
	const text = await getFileText(plugin, file);
	return countReadingUnits(stripFrontmatter(text));
}

export function buildPositionPatch(
	lineStart: number,
	scrollRatio: number,
	totalLines: number,
	totalWords: number,
): Partial<UserReadingState> {
	const progress = computeProgressFromLine(lineStart, totalLines);
	const wordsRead = Math.round(totalWords * progress);

	return {
		lineStart,
		scrollRatio,
		progress,
		totalWords,
		wordsRead,
	};
}

function stripFrontmatter(text: string): string {
	const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
	return match ? text.slice(match[0].length) : text;
}

function normalizeUserState(raw: Record<string, unknown>): UserReadingState {
	return {
		progress: toNumber(raw.progress, DEFAULT_USER_READING_STATE.progress),
		lineStart: toNumber(raw.lineStart, DEFAULT_USER_READING_STATE.lineStart),
		scrollRatio: toNumber(
			raw.scrollRatio,
			DEFAULT_USER_READING_STATE.scrollRatio,
		),
		updatedAt: toNumber(raw.updatedAt, DEFAULT_USER_READING_STATE.updatedAt),
		read: Boolean(raw.read),
		finished:
			typeof raw.finished === "string" && raw.finished.length > 0
				? raw.finished
				: null,
		totalWords: toNumber(
			raw.totalWords,
			DEFAULT_USER_READING_STATE.totalWords,
		),
		wordsRead: toNumber(raw.wordsRead, DEFAULT_USER_READING_STATE.wordsRead),
	};
}

function toNumber(value: unknown, fallback: number): number {
	if (typeof value === "number" && !Number.isNaN(value)) return value;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return fallback;
}
