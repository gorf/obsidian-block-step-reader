import { Setting } from "obsidian";
import { t } from "src/i18n";
import ReadingViewEnhancer from "src/main";
import { SUPPORT_KOFI_URL } from "src/constants";

export default class SupportSettings {
	constructor(settingsTabEl: HTMLElement, plugin: ReadingViewEnhancer) {
		settingsTabEl.createEl("h1", { text: t(plugin, "settings.support") });

		new Setting(settingsTabEl)
			.setName(t(plugin, "settings.buyMeACoffee"))
			.setDesc(t(plugin, "settings.supportDesc"))
			.addButton((button) => {
				button
					.setButtonText(t(plugin, "settings.buyMeACoffee"))
					.onClick(() => {
						window.open(SUPPORT_KOFI_URL, "_blank");
					});
			});
	}
}
