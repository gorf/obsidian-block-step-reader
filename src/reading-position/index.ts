import { Notice, TFile } from "obsidian";
import { t } from "src/i18n";
import ReadingViewEnhancer from "src/main";
import SelectionHandler from "src/block-selector/selection-handler";
import { BLOCK_ATTR } from "src/constants";
import {
	buildPositionPatch,
	buildReadingStats,
	getFileReadingUnitsAsync,
	markAsRead,
	markAsUnread,
	readUserStateFromCache,
	writeUserState,
	type ReadingStats,
	type UserReadingState,
} from "src/reading-state";
import ReadingProgressBar from "src/reading-ui/progress-bar";
import { getActiveView, getReadingViewContainer, isReadingView } from "src/utils";
import type { ReadingPosition, ReadingPositionStore } from "./types";

export default class ReadingPositionManager {
	private plugin: ReadingViewEnhancer;
	private saveTimer: number | null = null;
	private scrollListener: ((event: Event) => void) | null = null;
	private boundContainer: HTMLElement | null = null;
	private progressBar: ReadingProgressBar;
	private statsCache = new Map<string, ReadingStats>();
	private totalWordsCache = new Map<string, number>();
	private restoring = false;

	constructor(plugin: ReadingViewEnhancer) {
		this.plugin = plugin;
		this.progressBar = new ReadingProgressBar(plugin);
	}

	activate() {
		this.progressBar.activate();

		this.plugin.registerEvent(
			this.plugin.app.workspace.on("layout-change", () => {
				this.attachScrollListener();
				this.refreshProgressForActiveFile();
			}),
		);
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("active-leaf-change", () => {
				this.attachScrollListener();
				this.refreshProgressForActiveFile();
			}),
		);
		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on("changed", (file) => {
				this.refreshProgressForFile(file);
			}),
		);
	}

	onBlockSelected(
		block: HTMLElement,
		container: HTMLElement,
		options?: { center?: boolean },
	) {
		if (options?.center && this.plugin.settings.autoCenterBlock) {
			scrollBlockToCenter(block);
		}

		if (!this.plugin.settings.rememberReadingPosition) {
			this.updateProgressUi(block, container);
			return;
		}

		this.queueSave(container, block);
		this.updateProgressUi(block, container);
		this.maybeAutoMarkRead(block, container);
	}

	tryRestore(
		container: HTMLElement,
		selectionHandler: SelectionHandler,
	): boolean {
		if (!this.plugin.settings.rememberReadingPosition) return false;

		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file || !isReadingView(view)) return false;

		const state = this.resolveReadingState(file);
		if (!state) return false;

		this.restoring = true;

		const block = this.findBlockByLine(container, state.lineStart);
		if (block) {
			selectionHandler.select(block, { center: false });
			this.restoreScroll(container, state.scrollRatio);
		} else {
			this.restoreScroll(container, state.scrollRatio);
		}

		this.restoring = false;
		this.updateProgressFromState(file, state);

		if (this.plugin.settings.showRestoreNotice) {
			new Notice(t(this.plugin, "notice.restored"));
		}

		return true;
	}

	async saveNow() {
		const view = getActiveView(this.plugin);
		const container = getReadingViewContainer(view);
		const block = this.plugin.blockSelector.selectionHandler.selectedBlock;
		if (!view?.file || !container) return;

		await this.persistPosition(view.file, container, block);
		new Notice(t(this.plugin, "notice.saved"));
	}

	async restoreNow(selectionHandler: SelectionHandler) {
		const view = getActiveView(this.plugin);
		const container = getReadingViewContainer(view);
		if (!container) return;

		if (this.tryRestore(container, selectionHandler)) return;
		new Notice(t(this.plugin, "notice.noPosition"));
	}

	async markCurrentAsRead() {
		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file || !isReadingView(view)) return;

		const totalWords = await this.getTotalWords(file);
		await markAsRead(this.plugin, file, totalWords);
		this.refreshProgressForFile(file);
		new Notice(t(this.plugin, "notice.markedRead"));
	}

	async markCurrentAsUnread() {
		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file || !isReadingView(view)) return;

		await markAsUnread(this.plugin, file);
		this.refreshProgressForFile(file);
		new Notice(t(this.plugin, "notice.markedUnread"));
	}

	clearAll() {
		this.plugin.readingPositions = {};
		this.plugin.savePluginData();
		new Notice(t(this.plugin, "notice.clearedLegacy"));
	}

	hasSavedPosition(filePath: string | undefined): boolean {
		if (!filePath) return false;
		const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) {
			return Boolean(this.plugin.readingPositions[filePath]);
		}
		return Boolean(readUserStateFromCache(this.plugin, file));
	}

	getCachedStats(filePath: string): ReadingStats | null {
		return this.statsCache.get(filePath) ?? null;
	}

	private resolveReadingState(file: TFile): UserReadingState | null {
		const fromFrontmatter = readUserStateFromCache(this.plugin, file);
		if (fromFrontmatter) return fromFrontmatter;

		const legacy = this.plugin.readingPositions[file.path];
		if (!legacy) return null;

		return {
			progress: 0,
			lineStart: legacy.lineStart,
			scrollRatio: legacy.scrollRatio,
			updatedAt: legacy.updatedAt,
			read: false,
			finished: null,
			totalWords: 0,
			wordsRead: 0,
		};
	}

	private queueSave(container: HTMLElement, block: HTMLElement | null) {
		if (this.saveTimer) window.clearTimeout(this.saveTimer);

		this.saveTimer = window.setTimeout(() => {
			void this.flushSave(container, block);
		}, this.plugin.settings.readingPositionSaveDelayMs);
	}

	private async flushSave(
		container: HTMLElement,
		block: HTMLElement | null,
	) {
		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file) return;

		const currentBlock =
			this.plugin.blockSelector.selectionHandler.selectedBlock ?? block;
		await this.persistPosition(file, container, currentBlock);
	}

	private async persistPosition(
		file: TFile,
		container: HTMLElement,
		block: HTMLElement | null,
	) {
		const lineStart = this.getBlockLineStart(block);
		if (lineStart < 0) return;

		const scrollable = getScrollableElement(container);
		const scrollRatio = scrollable ? getScrollRatio(scrollable) : 0;
		const view = getActiveView(this.plugin);
		const totalLines = view?.editor.lineCount() ?? 1;
		const totalWords = await this.getTotalWords(file);
		const patch = buildPositionPatch(
			lineStart,
			scrollRatio,
			totalLines,
			totalWords,
		);

		await writeUserState(this.plugin, file, patch);

		delete this.plugin.readingPositions[file.path];
		await this.plugin.savePluginData();

		const state = readUserStateFromCache(this.plugin, file);
		if (state) this.updateProgressFromState(file, state);
	}

	private async getTotalWords(file: TFile): Promise<number> {
		const cached = this.totalWordsCache.get(file.path);
		if (cached !== undefined) return cached;

		const totalWords = await getFileReadingUnitsAsync(this.plugin, file);
		this.totalWordsCache.set(file.path, totalWords);
		return totalWords;
	}

	private updateProgressUi(block: HTMLElement | null, container: HTMLElement) {
		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file) return;

		void this.updateProgressUiAsync(file, block, container);
	}

	private async updateProgressUiAsync(
		file: TFile,
		block: HTMLElement | null,
		container: HTMLElement,
	) {
		const totalWords = await this.getTotalWords(file);
		const cachedState = readUserStateFromCache(this.plugin, file);
		const lineStart = this.getBlockLineStart(block);
		const view = getActiveView(this.plugin);
		const totalLines = view?.editor.lineCount() ?? 1;
		const scrollable = getScrollableElement(container);
		const scrollRatio = scrollable ? getScrollRatio(scrollable) : 0;

		const patch =
			lineStart >= 0
				? buildPositionPatch(lineStart, scrollRatio, totalLines, totalWords)
				: {};

		const stats = buildReadingStats(
			{ ...cachedState, ...patch },
			totalWords,
			this.plugin.settings.wordsPerMinute,
		);

		this.statsCache.set(file.path, stats);
		this.progressBar.update(stats);
	}

	private updateProgressFromState(file: TFile, state: UserReadingState) {
		void this.getTotalWords(file).then((totalWords) => {
			const stats = buildReadingStats(
				state,
				totalWords,
				this.plugin.settings.wordsPerMinute,
			);
			this.statsCache.set(file.path, stats);
			this.progressBar.update(stats);
		});
	}

	private refreshProgressForActiveFile() {
		const view = getActiveView(this.plugin);
		if (!view?.file || !isReadingView(view)) {
			this.progressBar.hide();
			return;
		}
		this.refreshProgressForFile(view.file);
	}

	private refreshProgressForFile(file: TFile) {
		this.totalWordsCache.delete(file.path);
		const state = readUserStateFromCache(this.plugin, file);
		if (state) {
			this.updateProgressFromState(file, state);
			return;
		}

		void this.getTotalWords(file).then((totalWords) => {
			const stats = buildReadingStats({}, totalWords, this.plugin.settings.wordsPerMinute);
			this.statsCache.set(file.path, stats);
			this.progressBar.update(stats);
		});
	}

	private async maybeAutoMarkRead(block: HTMLElement, container: HTMLElement) {
		if (!this.plugin.settings.autoMarkReadAtEnd || this.restoring) return;

		const view = getActiveView(this.plugin);
		const file = view?.file;
		if (!file) return;

		const state = readUserStateFromCache(this.plugin, file);
		if (state?.read) return;

		const blocks = container.querySelectorAll<HTMLElement>(`[${BLOCK_ATTR}=true]`);
		if (blocks.length === 0) return;

		const lastBlock = blocks[blocks.length - 1];
		if (block !== lastBlock) return;

		const totalWords = await this.getTotalWords(file);
		await markAsRead(this.plugin, file, totalWords);
		this.refreshProgressForFile(file);
		new Notice(t(this.plugin, "notice.autoMarkedRead"));
	}

	private findBlockByLine(
		container: HTMLElement,
		lineStart: number,
	): HTMLElement | null {
		const blocks = container.querySelectorAll<HTMLElement>(
			`[${BLOCK_ATTR}=true]`,
		);

		let fallback: HTMLElement | null = null;
		for (const block of Array.from(blocks)) {
			const blockLine = this.getBlockLineStart(block);
			if (blockLine === lineStart) return block;
			if (blockLine >= 0 && blockLine <= lineStart) fallback = block;
		}

		return fallback;
	}

	private getBlockLineStart(block: HTMLElement | null): number {
		if (!block) return -1;
		const value = block.getAttribute("data-rve-line-start");
		if (!value) return -1;
		const parsed = parseInt(value, 10);
		return Number.isNaN(parsed) ? -1 : parsed;
	}

	private restoreScroll(container: HTMLElement, scrollRatio: number) {
		const scrollable = getScrollableElement(container);
		if (!scrollable) return;
		applyScrollRatio(scrollable, scrollRatio);
	}

	private attachScrollListener() {
		const view = getActiveView(this.plugin);
		const container = getReadingViewContainer(view);
		if (!container || container === this.boundContainer) return;

		this.detachScrollListener();

		this.boundContainer = container;
		this.scrollListener = () => {
			if (!this.plugin.settings.rememberReadingPosition) {
				const block =
					this.plugin.blockSelector.selectionHandler.selectedBlock;
				this.updateProgressUi(block, container);
				return;
			}

			const block = this.plugin.blockSelector.selectionHandler.selectedBlock;
			this.queueSave(container, block);
			this.updateProgressUi(block, container);
		};
		container.addEventListener("scroll", this.scrollListener, {
			passive: true,
		});
	}

	private detachScrollListener() {
		if (this.boundContainer && this.scrollListener) {
			this.boundContainer.removeEventListener("scroll", this.scrollListener);
		}
		this.boundContainer = null;
		this.scrollListener = null;
	}
}

export function scrollBlockToCenter(block: HTMLElement): void {
	const scrollable = getScrollableParent(block);
	if (!scrollable) {
		block.scrollIntoView({ block: "center", behavior: "smooth" });
		return;
	}

	const blockRect = block.getBoundingClientRect();
	const scrollableRect = scrollable.getBoundingClientRect();
	const blockCenter = blockRect.top + blockRect.height / 2;
	const viewportCenter = scrollableRect.top + scrollableRect.height / 2;
	scrollable.scrollBy({
		top: blockCenter - viewportCenter,
		behavior: "smooth",
	});
}

function getScrollableParent(node: HTMLElement): HTMLElement | null {
	let current: HTMLElement | null = node;
	while (current) {
		if (current.scrollHeight > current.clientHeight) return current;
		current = current.parentElement;
	}
	return null;
}

export function getScrollableElement(
	container: HTMLElement,
): HTMLElement | null {
	if (container.scrollHeight > container.clientHeight) return container;

	let node: HTMLElement | null = container.parentElement;
	while (node) {
		if (node.scrollHeight > node.clientHeight) return node;
		node = node.parentElement;
	}

	return null;
}

export function getScrollRatio(scrollable: HTMLElement): number {
	const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
	if (maxScroll <= 0) return 0;
	return scrollable.scrollTop / maxScroll;
}

export function applyScrollRatio(
	scrollable: HTMLElement,
	ratio: number,
): void {
	const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
	scrollable.scrollTop = Math.max(0, Math.min(1, ratio)) * maxScroll;
}

export type { ReadingPosition, ReadingPositionStore };
