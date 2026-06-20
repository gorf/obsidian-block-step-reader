const BODY_CLASSES = [
	"bsr-collapse-always-on",
	"bsr-collapse-right",
	"bsr-align-checkbox",
	"bsr-scrollable-code",
] as const;

export function applyBlockColorCss(blockColor: {
	color: string;
	transparency: number;
}): void {
	const percentage = blockColor.transparency / 100;
	const colorWithAlpha = blockColor.color.replace(
		/\d+\s*\)$/,
		`${percentage})`,
	);
	document.body.setCssProps({
		"--bsr-block-color": colorWithAlpha,
	});
}

export function setBodyFeature(
	className: (typeof BODY_CLASSES)[number],
	active: boolean,
): void {
	document.body.toggleClass(className, active);
}

export function applyReadingFeatures(settings: {
	alwaysOnCollapseIndicator: boolean;
	collapseIndicatorOnTheRightSide: boolean;
	alignCheckboxToIndentationGuide: boolean;
	scrollableCode: boolean;
}): void {
	setBodyFeature(
		"bsr-collapse-always-on",
		settings.alwaysOnCollapseIndicator,
	);
	setBodyFeature(
		"bsr-collapse-right",
		settings.collapseIndicatorOnTheRightSide,
	);
	setBodyFeature(
		"bsr-align-checkbox",
		settings.alignCheckboxToIndentationGuide,
	);
	setBodyFeature("bsr-scrollable-code", settings.scrollableCode);
}

export function cleanupReadingFeatures(): void {
	for (const className of BODY_CLASSES) {
		document.body.removeClass(className);
	}
}

export function setProgressWidth(element: HTMLElement, progress: number): void {
	element.setCssProps({
		"--bsr-progress-width": `${Math.round(progress * 100)}%`,
	});
}
