import { WorkspaceLeaf } from "obsidian";
import { t } from "src/i18n";
import ReadingViewEnhancer from "src/main";
import { READING_LIBRARY_VIEW_TYPE } from "src/constants";
import ReadingLibraryView from "./view";

export { default as ReadingLibraryView } from "./view";
export * from "./types";
export * from "./service";

export function registerReadingLibrary(plugin: ReadingViewEnhancer): void {
	plugin.registerView(
		READING_LIBRARY_VIEW_TYPE,
		(leaf: WorkspaceLeaf) => new ReadingLibraryView(leaf, plugin),
	);

	plugin.addRibbonIcon("library", t(plugin, "library.openRibbon"), () => {
		void activateReadingLibrary(plugin);
	});
}

export async function activateReadingLibrary(
	plugin: ReadingViewEnhancer,
): Promise<void> {
	const { workspace } = plugin.app;
	const existing = workspace.getLeavesOfType(READING_LIBRARY_VIEW_TYPE);

	if (existing.length > 0) {
		workspace.revealLeaf(existing[0]);
		return;
	}

	const leaf = workspace.getRightLeaf(false);
	if (!leaf) return;

	await leaf.setViewState({
		type: READING_LIBRARY_VIEW_TYPE,
		active: true,
	});

	workspace.revealLeaf(leaf);
}

export function getReadingLibraryView(
	plugin: ReadingViewEnhancer,
): ReadingLibraryView | null {
	const leaf = plugin.app.workspace.getLeavesOfType(READING_LIBRARY_VIEW_TYPE)[0];
	return (leaf?.view as ReadingLibraryView) ?? null;
}
