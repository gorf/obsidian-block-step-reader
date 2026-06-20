import { Setting, ToggleComponent } from "obsidian";
import { t } from "src/i18n";
import ReadingViewEnhancer from "src/main";

export default class RememberReadingPositionSetting extends Setting {
	constructor(settingsTabEl: HTMLElement, plugin: ReadingViewEnhancer) {
		super(settingsTabEl);
		this.setName(t(plugin, "settings.rememberPosition"))
			.setDesc(t(plugin, "settings.rememberPositionDesc"))
			.addToggle((toggle) => {
				toggle
					.setValue(plugin.settings.rememberReadingPosition)
					.onChange(async (value) => {
						plugin.settings.rememberReadingPosition = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.showRestoreNotice"))
			.setDesc(t(plugin, "settings.showRestoreNoticeDesc"))
			.addToggle((toggle: ToggleComponent) => {
				toggle
					.setValue(plugin.settings.showRestoreNotice)
					.onChange(async (value) => {
						plugin.settings.showRestoreNotice = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.saveDelay"))
			.setDesc(t(plugin, "settings.saveDelayDesc"))
			.addText((text) => {
				text
					.setPlaceholder("500")
					.setValue(String(plugin.settings.readingPositionSaveDelayMs))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						plugin.settings.readingPositionSaveDelayMs =
							Number.isNaN(parsed) || parsed < 100
								? 500
								: Math.min(parsed, 5000);
						await plugin.saveSettings();
					});
			});

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.restoreDelay"))
			.setDesc(t(plugin, "settings.restoreDelayDesc"))
			.addText((text) => {
				text
					.setPlaceholder("300")
					.setValue(String(plugin.settings.readingPositionRestoreDelayMs))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						plugin.settings.readingPositionRestoreDelayMs =
							Number.isNaN(parsed) || parsed < 0
								? 300
								: Math.min(parsed, 3000);
						await plugin.saveSettings();
					});
			});
	}
}
