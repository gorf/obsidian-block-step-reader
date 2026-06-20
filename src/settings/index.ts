import { PluginSettingTab } from "obsidian";
import ReadingViewEnhancer from "../main";
import BlockSelectorSettings from "./block";
import KeysSettings from "./keys";
import MiscellaneousSettings from "./miscellaneous";
import SupportSettings from "./support";
import type { LocaleSetting } from "../i18n";
import type { LibraryFilter, LibrarySort } from "../reading-library/types";

export interface RveSettings {
	blockColor: {
		color: string;
		transparency: number;
	};
	enableBlockSelector: boolean;
	disableBlockSelectorOnMobile: boolean;
	alwaysOnCollapseIndicator: boolean;
	scrollableCode: boolean;
	autoSelectTopBlock: boolean;
	collapseIndicatorOnTheRightSide: boolean;
	alignCheckboxToIndentationGuide: boolean;
	nextBlockKeys: string;
	prevBlockKeys: string;
	toggleCollapseKeys: string;
	deselectKeys: string;
	rememberReadingPosition: boolean;
	showRestoreNotice: boolean;
	readingPositionSaveDelayMs: number;
	readingPositionRestoreDelayMs: number;
	userId: string;
	showReadingProgressBar: boolean;
	showReadingStats: boolean;
	autoCenterBlock: boolean;
	wordsPerMinute: number;
	autoMarkReadAtEnd: boolean;
	locale: LocaleSetting;
	libraryDefaultFilter: LibraryFilter;
	libraryDefaultSort: LibrarySort;
	libraryIncludeAllNotes: boolean;
}

export const DEFAULT_SETTINGS: RveSettings = {
	blockColor: {
		color: "rgba(139, 108, 239, 1)", // Obsidian default color
		transparency: 20,
	},
	enableBlockSelector: true,
	disableBlockSelectorOnMobile: false,
	alwaysOnCollapseIndicator: false,
	scrollableCode: false,
	autoSelectTopBlock: false,
	collapseIndicatorOnTheRightSide: false,
	alignCheckboxToIndentationGuide: false,
	nextBlockKeys: "ArrowDown KeyJ",
	prevBlockKeys: "ArrowUp KeyK",
	toggleCollapseKeys: "ArrowLeft ArrowRight KeyH KeyL",
	deselectKeys: "Escape",
	rememberReadingPosition: true,
	showRestoreNotice: false,
	readingPositionSaveDelayMs: 500,
	readingPositionRestoreDelayMs: 300,
	userId: "default",
	showReadingProgressBar: true,
	showReadingStats: true,
	autoCenterBlock: true,
	wordsPerMinute: 300,
	autoMarkReadAtEnd: false,
	locale: "auto",
	libraryDefaultFilter: "all",
	libraryDefaultSort: "updated",
	libraryIncludeAllNotes: false,
};

// ===================================================================

/**
 * Settings tab.
 * In this tab, you can change settings.
 *
 * - Block color
 * - Enable/Disable Block Selector
 */
export class RveSettingTab extends PluginSettingTab {
	plugin: ReadingViewEnhancer;

	constructor(plugin: ReadingViewEnhancer) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Displays settings tab.
	 */
	display() {
		const { containerEl } = this;

		// Clear all first
		containerEl.empty();

		// Add block selector settings
		new BlockSelectorSettings(containerEl, this.plugin);

		// Add miscellaneous settings
		new MiscellaneousSettings(containerEl, this.plugin);

		// Add keys settings
		new KeysSettings(containerEl, this.plugin);

		new SupportSettings(containerEl, this.plugin);
	}
}
