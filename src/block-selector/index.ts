import { Platform, type MarkdownPostProcessorContext } from "obsidian";

import ReadingViewEnhancer from "src/main";
import SelectionHandler from "./selection-handler";
import { BLOCKS, BLOCK_ATTR, BLOCK_SELECTOR, FRONTMATTER } from "../constants";
import {
	getActiveView,
	getReadingViewContainer,
	isReadingView,
} from "src/utils";

export default class BlockSelector {
	plugin: ReadingViewEnhancer;
	selectionHandler: SelectionHandler;
	private focusTimer: number | null = null;

	private readonly blockifyProcessor = (
		element: HTMLElement,
		context: MarkdownPostProcessorContext,
	): void => {
		this.blockify(element, context);
	};

	private readonly onActiveLeafChange = (): void => {
		this.selectionHandler.deselect();
		this.plugin.readingPosition.resetReadingSession();
		this.autoSelectTopBlock();
	};

	private readonly onLayoutChange = (): void => {
		if (this.plugin.readingPosition.hasActiveReadingSelection()) {
			return;
		}
		this.autoSelectTopBlock();
	};

	constructor(plugin: ReadingViewEnhancer) {
		this.plugin = plugin;
		this.selectionHandler = new SelectionHandler(plugin);
	}

	activate(): void {
		this.plugin.registerMarkdownPostProcessor(this.blockifyProcessor);
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("layout-change", this.onLayoutChange),
		);
		this.plugin.registerEvent(
			this.plugin.app.workspace.on(
				"active-leaf-change",
				this.onActiveLeafChange,
			),
		);
	}

	autoSelectTopBlock(): void {
		const view = getActiveView(this.plugin);
		if (!isReadingView(view)) return;

		const containerEl = getReadingViewContainer(view);
		if (!containerEl) return;

		if (this.focusTimer) window.clearTimeout(this.focusTimer);

		this.focusTimer = window.setTimeout(() => {
			const currentView = getActiveView(this.plugin);
			if (!isReadingView(currentView)) return;

			const container = getReadingViewContainer(currentView);
			if (!container) return;

			if (
				this.plugin.readingPosition.tryRestore(
					container,
					this.selectionHandler,
				)
			) {
				return;
			}

			if (this.plugin.settings.autoSelectTopBlock) {
				this.selectTopBlockInTheView(container);
			}
		}, this.plugin.settings.readingPositionRestoreDelayMs);
	}

	selectTopBlockInTheView(viewContainer: HTMLElement): void {
		this.selectionHandler.selectTopBlockInTheView(viewContainer);
	}

	toggleBlockHighlight(): void {
		void this.selectionHandler.selectedBlockHighlight();
	}

	private blockify(
		element: HTMLElement,
		context: MarkdownPostProcessorContext,
	): void {
		if (!this.plugin.settings.enableBlockSelector) return;

		if (
			(Platform.isMobile || Platform.isMobileApp) &&
			this.plugin.settings.disableBlockSelectorOnMobile
		) {
			return;
		}

		const container = this.getPostProcessorContainer(element);
		if (container && this.isContainerNotInitialized(container)) {
			this.initializeContainer(container);
		}

		this.elementsToBlocks(element, context);
	}

	private getPostProcessorContainer(element: HTMLElement): HTMLElement | null {
		const container = element.closest(".markdown-reading-view");
		return container?.instanceOf(HTMLElement) ? container : null;
	}

	private isContainerNotInitialized(container: HTMLElement): boolean {
		return !container.hasClass(BLOCK_SELECTOR);
	}

	private initializeContainer(container: HTMLElement): void {
		container.addClass(BLOCK_SELECTOR);

		container.addEventListener(
			"mousedown",
			this.selectionHandler.onMouseTouchStart,
		);
		container.addEventListener(
			"touchstart",
			this.selectionHandler.onMouseTouchStart,
		);
		container.addEventListener(
			"mouseup",
			this.selectionHandler.onMouseTouchEnd,
		);
		container.addEventListener(
			"touchend",
			this.selectionHandler.onMouseTouchEnd,
		);
		container.addEventListener("focusout", this.selectionHandler.onDeselect);
		container.addEventListener("keydown", this.selectionHandler.onKeyDown);
	}

	private elementsToBlocks(
		element: HTMLElement,
		context: MarkdownPostProcessorContext,
	): void {
		const section = context.getSectionInfo(element);
		const elements = element.querySelectorAll(BLOCKS.join(", "));
		elements.forEach((el) => {
			if (el.hasClass(FRONTMATTER)) return;
			el.setAttribute(BLOCK_ATTR, "true");
			el.setAttribute("tabindex", "-1");
			if (section?.lineStart && section?.lineEnd) {
				el.setAttribute("data-rve-line-start", section.lineStart.toString());
				el.setAttribute("data-rve-line-end", section.lineEnd.toString());
			}
		});
	}
}
