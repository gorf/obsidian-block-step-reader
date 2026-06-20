import type ReadingViewEnhancer from "src/main";
import en from "./en";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";
import type { LocaleId, LocaleSetting, TranslationKey, Translations } from "./types";

const locales: Record<LocaleId, Translations> = {
	en,
	"zh-CN": zhCN,
	"zh-TW": zhTW,
};

export function resolveLocale(plugin: ReadingViewEnhancer): LocaleId {
	const setting = plugin.settings.locale as LocaleSetting;
	if (setting !== "auto") return setting;

	const obsidianLang = getObsidianLanguage();
	if (obsidianLang.startsWith("zh")) {
		if (
			obsidianLang.includes("tw") ||
			obsidianLang.includes("hk") ||
			obsidianLang.includes("hant")
		) {
			return "zh-TW";
		}
		return "zh-CN";
	}

	return "en";
}

export function t(
	plugin: ReadingViewEnhancer,
	key: TranslationKey,
	params?: Record<string, string | number>,
): string {
	const locale = resolveLocale(plugin);
	let text = locales[locale][key] ?? locales.en[key] ?? key;

	if (params) {
		for (const [name, value] of Object.entries(params)) {
			text = text.replace(`{{${name}}}`, String(value));
		}
	}

	return text;
}

export function formatRemainingTime(
	plugin: ReadingViewEnhancer,
	minutes: number,
): string {
	if (minutes <= 0) return t(plugin, "stats.finished");
	if (minutes < 60) return t(plugin, "stats.minutes", { minutes });
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (mins > 0) return t(plugin, "stats.hoursMinutes", { hours, minutes: mins });
	return t(plugin, "stats.hours", { hours });
}

function getObsidianLanguage(): string {
	try {
		const stored = localStorage.getItem("language");
		if (stored) return stored.toLowerCase();
	} catch {
		// ignore
	}
	return "en";
}

export function pluginName(plugin: ReadingViewEnhancer): string {
	return t(plugin, "plugin.name");
}

export type { LocaleId, LocaleSetting, TranslationKey, Translations };
