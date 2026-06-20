import ReadingViewEnhancer from "src/main";
import AlwaysOnCollapseIndicatorSetting from "./always-on-collapse-indicator";
import AutoSelectTopBlockSetting from "./auto-select-top-block";
import CollapseIndicatorsOnTheRightSideSetting from "./collapse-indicators-on-the-right-side";
import CheckboxAlignWithIndentationGuideSetting from "./checkbox-align-with-indentation-guide";
import ScrollableCodeSetting from "./scrollable-code";
import RememberReadingPositionSetting from "./remember-reading-position";
import ReadingExperienceSettings from "./reading-experience";

/**
 * Registers settings components not related to block.
 */
export default class MiscellaneousSettings {
	constructor(containerEl: HTMLElement, plugin: ReadingViewEnhancer) {
		containerEl.createEl("h1", { text: "Miscellaneous" });
		new AlwaysOnCollapseIndicatorSetting(containerEl, plugin);
		new ScrollableCodeSetting(containerEl, plugin);
		new RememberReadingPositionSetting(containerEl, plugin);
		new ReadingExperienceSettings(containerEl, plugin);
		new AutoSelectTopBlockSetting(containerEl, plugin);
		new CollapseIndicatorsOnTheRightSideSetting(containerEl, plugin);
		new CheckboxAlignWithIndentationGuideSetting(containerEl, plugin);
	}
}
