import { SELECTED_BLOCK } from "./constants";

/**
 * Style rule that holds the template
 * and the function to inject variables
 */
class StyleRule {
	private template: string;
	private injectVariables: (template: string) => string;
	isActive: boolean;

	constructor(template: string, injectVariables: (template: string) => string) {
		this.template = template;
		this.isActive = false;
		this.injectVariables = injectVariables;
	}

	/**
	 * Get the rule after injecting variables
	 *
	 * @returns The rule
	 */
	getRule() {
		return this.injectVariables(this.template);
	}
}

/**
 * Block color rule.
 *
 * Accepts a block color and injects it into the template.
 */
export class BlockColorRule extends StyleRule {
	private color: string;
	private transparency: number;

	constructor() {
		const template = `
			.${SELECTED_BLOCK} {
				position: relative;
				z-index: 0;
			}
			
			.${SELECTED_BLOCK}::before {
				content: "";
				position: absolute;
				z-index: -1;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
				background-color: {{BLOCK_COLOR}};
			}
		`;
		super(template, (template: string) => {
			const percentage = this.transparency / 100;
			const transparencyApplied = this.color.replace(
				/\d+\s*\)$/,
				percentage + ")",
			);
			return template.replace("{{BLOCK_COLOR}}", transparencyApplied);
		});

		this.isActive = true;
	}

	/**
	 * Set the block color
	 *
	 * @param blockColor {string} The block color
	 */
	set(blockColor: { color: string; transparency: number }) {
		this.color = blockColor.color;
		this.transparency = blockColor.transparency;
	}
}

/**
 * Collapse indicator rule.
 *
 * No variables to inject.
 */
export class CollapseIndicatorAlwaysOnRule extends StyleRule {
	constructor() {
		const template = `
			.markdown-reading-view .markdown-preview-section .collapse-indicator {
				opacity: 1;
			}
		`;
		super(template, (template: string) => template);
	}
}

/**
 * Collapse indicator on the right side rule.
 *
 * No variables to inject.
 */
export class CollapseIndicatorOnTheRightSideRule extends StyleRule {
	isCheckboxAligned: boolean;

	constructor() {
		const template = `
			.markdown-reading-view .markdown-preview-section>div:not([class="markdown-preview-pusher"]),
			.markdown-reading-view .markdown-preview-section>div:not([class="mod-header"]) {
					position: relative;
			}

			.markdown-reading-view .markdown-preview-section .collapse-indicator {
					right: -1rem;
					padding-inline-end: 0;
			}

			.markdown-reading-view .markdown-preview-section > div > .has-list-bullet > li {
					margin-inline-start: calc(var(--list-indent) * {{LIST_INDENT}});
			}
		`;
		super(template, (template: string) =>
			template.replace(
				"{{LIST_INDENT}}",
				this.isCheckboxAligned ? "0.7" : "0.8",
			),
		);
	}
}

export class AlignCheckboxToIndentationGuide extends StyleRule {
	constructor() {
		const template = `
			.markdown-reading-view ul > li.task-list-item .task-list-item-checkbox {
					margin-inline-start: calc(var(--checkbox-size) * -1.35);
			}
		`;
		super(template, (template: string) => template);
	}
}

/**
 * Scrollable code rule.
 *
 * No variables to inject.
 */
export class ScrollableCodeRule extends StyleRule {
	constructor() {
		const template = `
			.markdown-reading-view .markdown-preview-section div > pre {
				overflow: hidden;
				white-space: pre-wrap;
			}

			.markdown-reading-view .markdown-preview-section div > pre > code {
				display: block;
				overflow: auto;
				white-space: pre;
			}
		`;
		super(template, (template: string) => template);
	}
}

export class ReadingProgressBarRule extends StyleRule {
	constructor() {
		const template = `
			.bsr-progress-bar {
				position: sticky;
				bottom: 0;
				z-index: 10;
				margin-top: 1rem;
				padding: 0.5rem 0.75rem 0.75rem;
				border-top: 1px solid var(--background-modifier-border);
				background: color-mix(in srgb, var(--background-primary) 92%, transparent);
				backdrop-filter: blur(6px);
			}

			.bsr-progress-bar-hidden {
				display: none;
			}

			.bsr-progress-track {
				height: 4px;
				border-radius: 999px;
				background: var(--background-modifier-border);
				overflow: hidden;
			}

			.bsr-progress-fill {
				height: 100%;
				width: 0;
				border-radius: 999px;
				background: var(--interactive-accent);
				transition: width 0.2s ease;
			}

			.bsr-progress-label {
				margin-top: 0.35rem;
				font-size: 0.8rem;
				color: var(--text-muted);
				text-align: center;
			}
		`;
		super(template, (template: string) => template);
		this.isActive = true;
	}
}

export class ReadingLibraryRule extends StyleRule {
	constructor() {
		const template = `
			.bsr-library-view {
				display: flex;
				flex-direction: column;
				height: 100%;
				padding: 0.75rem;
				gap: 0.75rem;
			}

			.bsr-library-toolbar {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}

			.bsr-library-filters {
				display: flex;
				flex-wrap: wrap;
				gap: 0.35rem;
			}

			.bsr-library-filter {
				border: 1px solid var(--background-modifier-border);
				background: var(--background-secondary);
				color: var(--text-muted);
				border-radius: 999px;
				padding: 0.2rem 0.65rem;
				font-size: 0.75rem;
				cursor: pointer;
			}

			.bsr-library-filter.is-active {
				background: var(--interactive-accent);
				border-color: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.bsr-library-controls {
				display: flex;
				flex-wrap: wrap;
				gap: 0.5rem;
				align-items: center;
			}

			.bsr-library-search {
				flex: 1 1 120px;
				min-width: 120px;
			}

			.bsr-library-list {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
				overflow: auto;
				flex: 1 1 auto;
			}

			.bsr-library-empty {
				color: var(--text-muted);
				font-size: 0.85rem;
				padding: 1rem 0.25rem;
			}

			.bsr-library-item {
				border: 1px solid var(--background-modifier-border);
				border-radius: 0.65rem;
				padding: 0.65rem 0.75rem;
				cursor: pointer;
				background: var(--background-primary);
			}

			.bsr-library-item:hover {
				border-color: var(--interactive-accent);
			}

			.bsr-library-item-main {
				display: flex;
				flex-direction: column;
				gap: 0.15rem;
			}

			.bsr-library-item-title {
				font-weight: 600;
				font-size: 0.9rem;
			}

			.bsr-library-item-path {
				font-size: 0.72rem;
				color: var(--text-faint);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.bsr-library-item-meta {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				margin-top: 0.45rem;
			}

			.bsr-library-item-progress-text {
				font-size: 0.75rem;
				color: var(--text-muted);
				min-width: 2.5rem;
			}

			.bsr-library-item-track {
				flex: 1 1 auto;
				height: 4px;
				border-radius: 999px;
				background: var(--background-modifier-border);
				overflow: hidden;
			}

			.bsr-library-item-fill {
				height: 100%;
				background: var(--interactive-accent);
			}

			.bsr-library-item-subtitle {
				margin-top: 0.35rem;
				font-size: 0.75rem;
				color: var(--text-muted);
			}
		`;
		super(template, (template: string) => template);
		this.isActive = true;
	}
}

type RuleKey =
	| "block-color"
	| "collapse-indicator-always-on"
	| "collapse-indicator-on-the-right-side"
	| "align-checkbox-to-indentation-guide"
	| "scrollable-code"
	| "reading-progress-bar"
	| "reading-library";

/**
 * The class that manages all style rules.
 */
export default class RveStyles {
	styleTag: HTMLStyleElement;
	rules: Record<RuleKey, StyleRule>;

	constructor() {
		this.styleTag = document.createElement("style");
		this.styleTag.id = "rve-styles";
		document.getElementsByTagName("head")[0].appendChild(this.styleTag);

		this.rules = {
			"block-color": new BlockColorRule(),
			"collapse-indicator-always-on": new CollapseIndicatorAlwaysOnRule(),
			"collapse-indicator-on-the-right-side":
				new CollapseIndicatorOnTheRightSideRule(),
			"align-checkbox-to-indentation-guide":
				new AlignCheckboxToIndentationGuide(),
			"scrollable-code": new ScrollableCodeRule(),
			"reading-progress-bar": new ReadingProgressBarRule(),
			"reading-library": new ReadingLibraryRule(),
		};
	}

	/**
	 * Clean up the style tag
	 */
	cleanup() {
		this.styleTag.remove();
	}

	/**
	 * Get a rule by key
	 *
	 * @param rule rule's key
	 * @returns One of the rules
	 */
	of(rule: RuleKey) {
		return this.rules[rule];
	}

	/**
	 * Apply all active rules
	 */
	apply() {
		const style = Object.values(this.rules)
			.filter((rule) => rule.isActive)
			.map((rule) => rule.getRule())
			.join("\n");

		this.styleTag.innerHTML = style;
	}
}
