import { Setting } from "obsidian";
import { t } from "src/i18n";
import ReadingViewEnhancer from "src/main";
import type { LocaleSetting } from "src/i18n";
import type { LibraryFilter, LibrarySort } from "src/reading-library/types";
import { buildReadTag, getUserId, runSyncAllReadTagsCommand } from "src/reading-state";

export default class ReadingExperienceSettings {
	constructor(settingsTabEl: HTMLElement, plugin: ReadingViewEnhancer) {
		settingsTabEl.createEl("h1", { text: t(plugin, "settings.readingExperience") });

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.locale"))
			.setDesc(t(plugin, "settings.localeDesc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption("auto", t(plugin, "settings.locale.auto"))
					.addOption("en", t(plugin, "settings.locale.en"))
					.addOption("zh-CN", t(plugin, "settings.locale.zhCN"))
					.addOption("zh-TW", t(plugin, "settings.locale.zhTW"))
					.setValue(plugin.settings.locale)
					.onChange(async (value) => {
						plugin.settings.locale = value as LocaleSetting;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.userId"))
			.setDesc(t(plugin, "settings.userIdDesc"))
			.addText((text) => {
				text
					.setPlaceholder("default")
					.setValue(plugin.settings.userId)
					.onChange(async (value) => {
						plugin.settings.userId = value.trim() || "default";
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.showProgressBar"))
			.setDesc(t(plugin, "settings.showProgressBarDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.showReadingProgressBar)
					.onChange(async (value) => {
						plugin.settings.showReadingProgressBar = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.showStats"))
			.setDesc(t(plugin, "settings.showStatsDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.showReadingStats)
					.onChange(async (value) => {
						plugin.settings.showReadingStats = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.autoCenter"))
			.setDesc(t(plugin, "settings.autoCenterDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.autoCenterBlock)
					.onChange(async (value) => {
						plugin.settings.autoCenterBlock = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.wpm"))
			.setDesc(t(plugin, "settings.wpmDesc"))
			.addText((text) => {
				text
					.setPlaceholder("300")
					.setValue(String(plugin.settings.wordsPerMinute))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						plugin.settings.wordsPerMinute =
							Number.isNaN(parsed) || parsed < 50 ? 300 : Math.min(parsed, 2000);
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.autoMarkRead"))
			.setDesc(t(plugin, "settings.autoMarkReadDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.autoMarkReadAtEnd)
					.onChange(async (value) => {
						plugin.settings.autoMarkReadAtEnd = value;
						await plugin.saveSettings();
					});
			});

		const readTag = buildReadTag(getUserId(plugin));
		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.syncReadTags"))
			.setDesc(
				t(plugin, "settings.syncReadTagsDesc", { tag: readTag }),
			)
			.addToggle((toggle) => {
				toggle.setValue(plugin.settings.syncReadTags).onChange(async (value) => {
					plugin.settings.syncReadTags = value;
					await plugin.saveSettings();
				});
			})
			.addButton((button) => {
				button
					.setButtonText(t(plugin, "settings.syncReadTagsNow"))
					.setTooltip(t(plugin, "settings.syncReadTagsNowDesc"))
					.onClick(() => {
						void runSyncAllReadTagsCommand(plugin);
					});
			});

		settingsTabEl.createEl("h2", { text: t(plugin, "library.title") });

		new Setting(settingsTabEl)
			.setName(t(plugin, "library.includeAllNotes"))
			.setDesc(t(plugin, "library.includeAllNotesDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.libraryIncludeAllNotes)
					.onChange(async (value) => {
						plugin.settings.libraryIncludeAllNotes = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.libraryDefaultFilter"))
			.setDesc(t(plugin, "settings.libraryDefaultFilterDesc"))
			.addDropdown((dropdown) => {
				const filters: LibraryFilter[] = ["all", "reading", "unread", "read"];
				for (const filter of filters) {
					dropdown.addOption(filter, filterLabel(plugin, filter));
				}
				dropdown
					.setValue(plugin.settings.libraryDefaultFilter)
					.onChange(async (value) => {
						plugin.settings.libraryDefaultFilter = value as LibraryFilter;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.libraryDefaultSort"))
			.setDesc(t(plugin, "settings.libraryDefaultSortDesc"))
			.addDropdown((dropdown) => {
				const sorts: LibrarySort[] = [
					"updated",
					"progress-desc",
					"progress-asc",
					"title",
					"finished",
					"remaining",
				];
				for (const sort of sorts) {
					dropdown.addOption(sort, sortLabel(plugin, sort));
				}
				dropdown
					.setValue(plugin.settings.libraryDefaultSort)
					.onChange(async (value) => {
						plugin.settings.libraryDefaultSort = value as LibrarySort;
						await plugin.saveSettings();
					});
			});
	}
}

function filterLabel(
	plugin: ReadingViewEnhancer,
	filter: LibraryFilter,
): string {
	const map = {
		all: "library.filter.all",
		reading: "library.filter.reading",
		unread: "library.filter.unread",
		read: "library.filter.read",
	} as const;
	return t(plugin, map[filter]);
}

function sortLabel(plugin: ReadingViewEnhancer, sort: LibrarySort): string {
	const map = {
		updated: "library.sort.updated",
		"progress-asc": "library.sort.progressAsc",
		"progress-desc": "library.sort.progressDesc",
		title: "library.sort.title",
		finished: "library.sort.finished",
		remaining: "library.sort.remaining",
	} as const;
	return t(plugin, map[sort]);
}
