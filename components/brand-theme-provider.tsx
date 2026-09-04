"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BrandThemeColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	sidebar: string;
}

export interface BrandTheme {
	name: string;
	colors: BrandThemeColors;
}

interface BrandThemeContextValue {
	theme: BrandTheme;
	applyTheme: (theme: BrandTheme) => void;
	resetTheme: () => void;
	presets: BrandTheme[];
}

// ─── Presets de tema ──────────────────────────────────────────────────────────

export const DEFAULT_THEME: BrandTheme = {
	name: "El Rincón (Predeterminado)",
	colors: {
		primary: "#FF6B00",
		secondary: "#4CAF1A",
		accent: "#00B8A9",
		background: "#FEFCF5",
		sidebar: "#1A1035",
	},
};

export const PRESET_THEMES: BrandTheme[] = [
	DEFAULT_THEME,
	{
		name: "Pastel Suave",
		colors: {
			primary: "#E98B6C",
			secondary: "#7CBF8E",
			accent: "#6DBCCA",
			background: "#FFF8F5",
			sidebar: "#3D2C4E",
		},
	},
	{
		name: "Violeta Vibrante",
		colors: {
			primary: "#7B2FBE",
			secondary: "#FF3D9A",
			accent: "#00B8A9",
			background: "#F8F5FF",
			sidebar: "#1E0A3C",
		},
	},
	{
		name: "Arcoíris Tropical",
		colors: {
			primary: "#FF3D9A",
			secondary: "#FFD600",
			accent: "#4CAF1A",
			background: "#FFFBF0",
			sidebar: "#0D2137",
		},
	},
	{
		name: "Azul Marino Kids",
		colors: {
			primary: "#1976D2",
			secondary: "#FF9800",
			accent: "#00B8A9",
			background: "#F5F8FF",
			sidebar: "#0D1B3E",
		},
	},
];

const STORAGE_KEY = "rincon-brand-theme";

// ─── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Convierte un color hex a componentes oklch aproximados.
 * Se usa para inyectar los colores custom en el sistema de diseño Tailwind/shadcn.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

function rgbToOklch(r: number, g: number, b: number): string {
	// Linealizar
	const toLinear = (c: number) => {
		const v = c / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	const lr = toLinear(r);
	const lg = toLinear(g);
	const lb = toLinear(b);

	// sRGB → OKLab (approx via XYZ D65)
	const l =
		0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
	const m =
		0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
	const s =
		0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

	const C = Math.sqrt(a * a + bVal * bVal);
	const H = (Math.atan2(bVal, a) * 180) / Math.PI;
	const hue = H < 0 ? H + 360 : H;

	return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${hue.toFixed(2)})`;
}

function hexToOklch(hex: string): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	return rgbToOklch(rgb.r, rgb.g, rgb.b);
}

/**
 * Aclara un color oklch para usar como foreground (mezcla hacia blanco)
 */
function lightenOklch(oklch: string, amount: number = 0.3): string {
	const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
	if (!match) return oklch;
	const L = parseFloat(match[1]);
	const C = parseFloat(match[2]);
	const H = parseFloat(match[3]);
	return `oklch(${Math.min(1, L + amount).toFixed(4)} ${(C * 0.3).toFixed(4)} ${H.toFixed(2)})`;
}

/**
 * Calcula la luminancia relativa de un color hex (0 = negro, 1 = blanco)
 */
function getLuminance(hex: string): number {
	const rgb = hexToRgb(hex);
	if (!rgb) return 0.5;
	const toLinear = (c: number) => {
		const v = c / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	const r = toLinear(rgb.r);
	const g = toLinear(rgb.g);
	const b = toLinear(rgb.b);
	// Luminancia relativa perceptual (WCAG)
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Aplica los colores del tema como variables CSS en :root.
 * Deriva automáticamente foreground, card, border y muted
 * en función de la luminancia del fondo elegido.
 */
function applyColorsToRoot(colors: BrandThemeColors) {
	const root = document.documentElement;
	const primaryOklch = hexToOklch(colors.primary);
	const secondaryOklch = hexToOklch(colors.secondary);
	const accentOklch = hexToOklch(colors.accent);
	const bgOklch = hexToOklch(colors.background);
	const sidebarOklch = hexToOklch(colors.sidebar);

	// Determinar si el fondo es claro u oscuro
	const bgLuminance = getLuminance(colors.background);
	const bgIsLight = bgLuminance > 0.4;

	// Foreground principal: oscuro sobre fondo claro, claro sobre fondo oscuro
	const foreground = bgIsLight
		? "oklch(0.18 0.02 270)"
		: "oklch(0.95 0.01 80)";
	const cardBg = bgIsLight
		? "oklch(1 0 0)"
		: "oklch(0.21 0.025 270)";
	const mutedBg = bgIsLight
		? "oklch(0.94 0.01 80)"
		: "oklch(0.25 0.025 270)";
	const mutedFg = bgIsLight
		? "oklch(0.48 0.04 270)"
		: "oklch(0.65 0.02 270)";
	const borderColor = bgIsLight
		? "oklch(0.88 0.02 80)"
		: "oklch(0.28 0.03 270)";
	const inputColor = bgIsLight
		? "oklch(0.93 0.01 80)"
		: "oklch(0.30 0.02 270)";
	const popoverBg = bgIsLight ? "oklch(1 0 0)" : "oklch(0.21 0.025 270)";

	// ─── Fondo y texto principal ───────────────────────────────────────────────
	root.style.setProperty("--background", bgOklch);
	root.style.setProperty("--foreground", foreground);

	// ─── Card ──────────────────────────────────────────────────────────────────
	root.style.setProperty("--card", cardBg);
	root.style.setProperty("--card-foreground", foreground);

	// ─── Popover ───────────────────────────────────────────────────────────────
	root.style.setProperty("--popover", popoverBg);
	root.style.setProperty("--popover-foreground", foreground);

	// ─── Muted ─────────────────────────────────────────────────────────────────
	root.style.setProperty("--muted", mutedBg);
	root.style.setProperty("--muted-foreground", mutedFg);

	// ─── Border / Input ────────────────────────────────────────────────────────
	root.style.setProperty("--border", borderColor);
	root.style.setProperty("--input", inputColor);

	// ─── Colores de acción ─────────────────────────────────────────────────────
	root.style.setProperty("--primary", primaryOklch);
	root.style.setProperty("--primary-foreground", "oklch(1 0 0)");
	root.style.setProperty("--secondary", secondaryOklch);
	root.style.setProperty("--secondary-foreground", "oklch(1 0 0)");
	root.style.setProperty("--accent", accentOklch);
	root.style.setProperty("--accent-foreground", "oklch(1 0 0)");
	root.style.setProperty("--ring", primaryOklch);

	// ─── Sidebar ───────────────────────────────────────────────────────────────
	// Determinar si el sidebar es claro u oscuro
	const sidebarLuminance = getLuminance(colors.sidebar);
	const sidebarIsLight = sidebarLuminance > 0.4;
	const sidebarFg = sidebarIsLight
		? "oklch(0.18 0.02 270)"
		: "oklch(0.97 0.01 80)";
	const sidebarAccentBg = sidebarIsLight
		? "oklch(0.88 0.02 80)"
		: lightenOklch(sidebarOklch, 0.08);
	const sidebarAccentFg = sidebarFg;

	root.style.setProperty("--sidebar", sidebarOklch);
	root.style.setProperty("--sidebar-foreground", sidebarFg);
	root.style.setProperty("--sidebar-primary", primaryOklch);
	root.style.setProperty("--sidebar-primary-foreground", "oklch(1 0 0)");
	root.style.setProperty("--sidebar-accent", sidebarAccentBg);
	root.style.setProperty("--sidebar-accent-foreground", sidebarAccentFg);
	root.style.setProperty("--sidebar-border", borderColor);
	root.style.setProperty("--sidebar-ring", primaryOklch);

	// ─── Charts ────────────────────────────────────────────────────────────────
	root.style.setProperty("--chart-1", primaryOklch);
	root.style.setProperty("--chart-2", secondaryOklch);
	root.style.setProperty("--chart-3", accentOklch);

	// ─── Variables de marca ────────────────────────────────────────────────────
	root.style.setProperty("--brand-orange", colors.primary);
	root.style.setProperty("--brand-teal", colors.accent);
}


/**
 * Limpia las variables inline del root (vuelve a los valores del CSS)
 */
function clearColorsFromRoot() {
	const root = document.documentElement;
	const vars = [
		"--background",
		"--foreground",
		"--card",
		"--card-foreground",
		"--popover",
		"--popover-foreground",
		"--muted",
		"--muted-foreground",
		"--border",
		"--input",
		"--primary",
		"--primary-foreground",
		"--secondary",
		"--secondary-foreground",
		"--accent",
		"--accent-foreground",
		"--ring",
		"--sidebar",
		"--sidebar-foreground",
		"--sidebar-primary",
		"--sidebar-primary-foreground",
		"--sidebar-accent",
		"--sidebar-accent-foreground",
		"--sidebar-border",
		"--sidebar-ring",
		"--chart-1",
		"--chart-2",
		"--chart-3",
		"--brand-orange",
		"--brand-teal",
	];
	vars.forEach((v) => root.style.removeProperty(v));
}


// ─── Context ──────────────────────────────────────────────────────────────────

const BrandThemeContext = createContext<BrandThemeContextValue>({
	theme: DEFAULT_THEME,
	applyTheme: () => {},
	resetTheme: () => {},
	presets: PRESET_THEMES,
});

export function BrandThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [theme, setTheme] = useState<BrandTheme>(() => {
		if (typeof window === "undefined") return DEFAULT_THEME;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				return JSON.parse(saved);
			}
		} catch {
			// Ignorar errores de localStorage
		}
		return DEFAULT_THEME;
	});

	// Sincronizar colores del tema en el DOM al montar
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed: BrandTheme = JSON.parse(saved);
				applyColorsToRoot(parsed.colors);
			}
		} catch {
			// Ignorar errores de localStorage
		}
	}, []);

	const applyTheme = useCallback((newTheme: BrandTheme) => {
		setTheme(newTheme);
		applyColorsToRoot(newTheme.colors);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
		} catch {
			// Ignorar errores de localStorage
		}
	}, []);

	const resetTheme = useCallback(() => {
		setTheme(DEFAULT_THEME);
		clearColorsFromRoot();
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignorar errores de localStorage
		}
	}, []);

	return (
		<BrandThemeContext.Provider
			value={{ theme, applyTheme, resetTheme, presets: PRESET_THEMES }}
		>
			{children}
		</BrandThemeContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBrandTheme() {
	return useContext(BrandThemeContext);
}
