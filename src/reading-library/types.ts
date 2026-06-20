export type LibraryFilter = "all" | "reading" | "unread" | "read";

export type LibrarySort =
	| "updated"
	| "progress-asc"
	| "progress-desc"
	| "title"
	| "finished"
	| "remaining";

export interface LibraryEntry {
	filePath: string;
	title: string;
	progress: number;
	read: boolean;
	finished: string | null;
	updatedAt: number;
	remainingMinutes: number;
	hasActivity: boolean;
}

export interface LibraryQuery {
	filter: LibraryFilter;
	sort: LibrarySort;
	search: string;
	includeAllNotes: boolean;
}
