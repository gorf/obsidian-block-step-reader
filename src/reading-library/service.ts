import { TFile } from "obsidian";
import ReadingViewEnhancer from "src/main";
import {
	buildReadingStats,
	readUserStateFromCache,
	type UserReadingState,
} from "src/reading-state";
import { DEFAULT_USER_READING_STATE } from "src/reading-state/types";
import type { LibraryEntry, LibraryFilter, LibraryQuery, LibrarySort } from "./types";

export function collectLibraryEntries(
	plugin: ReadingViewEnhancer,
	includeAllNotes: boolean,
): LibraryEntry[] {
	const files = plugin.app.vault.getMarkdownFiles();
	const entries: LibraryEntry[] = [];

	for (const file of files) {
		const state = readUserStateFromCache(plugin, file);
		const hasActivity = state !== null && state.updatedAt > 0;

		if (!includeAllNotes && !hasActivity && !state?.read) {
			continue;
		}

		entries.push(buildEntry(plugin, file, state, hasActivity));
	}

	return entries;
}

export function filterEntries(
	entries: LibraryEntry[],
	filter: LibraryFilter,
): LibraryEntry[] {
	switch (filter) {
		case "reading":
			return entries.filter((e) => !e.read && e.progress > 0 && e.progress < 1);
		case "unread":
			return entries.filter((e) => !e.read && e.progress === 0);
		case "read":
			return entries.filter((e) => e.read);
		default:
			return entries;
	}
}

export function sortEntries(
	entries: LibraryEntry[],
	sort: LibrarySort,
): LibraryEntry[] {
	const sorted = [...entries];

	sorted.sort((a, b) => {
		switch (sort) {
			case "progress-asc":
				return a.progress - b.progress || a.title.localeCompare(b.title);
			case "progress-desc":
				return b.progress - a.progress || a.title.localeCompare(b.title);
			case "title":
				return a.title.localeCompare(b.title);
			case "finished":
				return compareFinished(b.finished, a.finished) || b.updatedAt - a.updatedAt;
			case "remaining":
				return a.remainingMinutes - b.remainingMinutes || b.progress - a.progress;
			case "updated":
			default:
				return b.updatedAt - a.updatedAt || a.title.localeCompare(b.title);
		}
	});

	return sorted;
}

export function searchEntries(
	entries: LibraryEntry[],
	search: string,
): LibraryEntry[] {
	const query = search.trim().toLowerCase();
	if (!query) return entries;

	return entries.filter(
		(entry) =>
			entry.title.toLowerCase().includes(query) ||
			entry.filePath.toLowerCase().includes(query),
	);
}

export function queryLibrary(
	plugin: ReadingViewEnhancer,
	query: LibraryQuery,
): LibraryEntry[] {
	const all = collectLibraryEntries(plugin, query.includeAllNotes);
	const filtered = filterEntries(all, query.filter);
	const searched = searchEntries(filtered, query.search);
	return sortEntries(searched, query.sort);
}

function buildEntry(
	plugin: ReadingViewEnhancer,
	file: TFile,
	state: UserReadingState | null,
	hasActivity: boolean,
): LibraryEntry {
	const normalized = state ?? { ...DEFAULT_USER_READING_STATE };
	const totalWords = normalized.totalWords || 0;
	const stats = buildReadingStats(
		normalized,
		totalWords,
		plugin.settings.wordsPerMinute,
	);

	return {
		filePath: file.path,
		title: file.basename,
		progress: stats.progress,
		read: stats.read,
		finished: stats.finished,
		updatedAt: normalized.updatedAt,
		remainingMinutes: stats.remainingMinutes,
		hasActivity,
	};
}

function compareFinished(a: string | null, b: string | null): number {
	if (!a && !b) return 0;
	if (!a) return -1;
	if (!b) return 1;
	return a.localeCompare(b);
}
