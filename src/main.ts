import { Plugin } from "obsidian";
import { t } from "./i18n";
import {
	applyBlockColorCss,
	applyReadingFeatures,
	cleanupReadingFeatures,
} from "./styles";
import { RveSettingTab, RveSettings, DEFAULT_SETTINGS } from "./settings";
import Commands from "./commands";
import BlockSelector from "./block-selector";
import ReadingPositionManager, {
	type ReadingPositionStore,
} from "./reading-position";
import { registerReadingLibrary } from "./reading-library";

export default class ReadingViewEnhancer extends Plugin {
	settings: RveSettings;
	readingPositions: ReadingPositionStore = {};
	blockSelector: BlockSelector;
	readingPosition: ReadingPositionManager;

	async onload() {
		await this.loadSettings();
		this.app.workspace.onLayoutReady(() => this.applySettingsToStyles());

		this.blockSelector = new BlockSelector(this);
		this.blockSelector.activate();

		this.readingPosition = new ReadingPositionManager(this);
		this.readingPosition.activate();

		registerReadingLibrary(this);

		new Commands(this).register();

		this.addSettingTab(new RveSettingTab(this));

		console.log(t(this, "plugin.loaded"));
	}

	async onunload() {
		cleanupReadingFeatures();
		console.log(t(this, "plugin.unloaded"));
	}

	async loadSettings() {
		const data = (await this.loadData()) as
			| (Partial<RveSettings> & { readingPositions?: ReadingPositionStore })
			| null;
		this.readingPositions = data?.readingPositions ?? {};
		const { readingPositions: _readingPositions, ...settingsData } = data ?? {};
		this.settings = Object.assign({}, DEFAULT_SETTINGS, settingsData);
	}

	async saveSettings() {
		await this.savePluginData();
	}

	async savePluginData() {
		await this.saveData({
			...this.settings,
			readingPositions: this.readingPositions,
		});
	}

	private applySettingsToStyles() {
		this.applyBlockColor();
		this.applyReadingFeatureStyles();
	}

	applyBlockColor(_isImmediate = false) {
		applyBlockColorCss(this.settings.blockColor);
	}

	applyAlwaysOnCollapse(_isImmediate = false) {
		this.applyReadingFeatureStyles();
	}

	applyCollapseIndicatorOnTheRightSide(_isImmediate = false) {
		this.applyReadingFeatureStyles();
	}

	applyAlignCheckboxToIndentationGuide(_isImmediate = false) {
		this.applyReadingFeatureStyles();
	}

	applyScrollableCode(_isImmediate = false) {
		this.applyReadingFeatureStyles();
	}

	private applyReadingFeatureStyles() {
		applyReadingFeatures(this.settings);
	}
}
