"use client";

import { CheckIcon, RotateCcwIcon, SaveIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	DEFAULT_THEME,
	useBrandTheme,
	type BrandTheme,
	type BrandThemeColors,
} from "@/components/brand-theme-provider";

// ─── Swatch de preview ────────────────────────────────────────────────────────

function ColorSwatch({ color, label }: { color: string; label: string }) {
	return (
		<div className="flex flex-col items-center gap-1.5">
			<div
				className="h-8 w-8 rounded-full border-2 border-white shadow-md ring-1 ring-black/10"
				style={{ backgroundColor: color }}
			/>
			<span className="text-[10px] text-muted-foreground">{label}</span>
		</div>
	);
}

// ─── Miniatura de vista previa ────────────────────────────────────────────────

function ThemePreview({ colors }: { colors: BrandThemeColors }) {
	return (
		<div
			className="overflow-hidden rounded-xl border border-border/60 shadow-lg"
			style={{ background: colors.background }}
		>
			{/* Sidebar mini */}
			<div className="flex h-28">
				<div
					className="flex w-14 flex-col gap-1.5 p-2"
					style={{ background: colors.sidebar }}
				>
					<div
						className="h-2 w-8 rounded-full opacity-80"
						style={{ background: colors.primary }}
					/>
					<div className="h-1.5 w-6 rounded-full bg-white/30" />
					<div className="h-1.5 w-7 rounded-full bg-white/30" />
					<div className="h-1.5 w-5 rounded-full bg-white/30" />
					<div className="mt-auto h-1.5 w-6 rounded-full bg-white/20" />
				</div>
				{/* Content mini */}
				<div className="flex flex-1 flex-col gap-2 p-3">
					<div className="h-2 w-20 rounded-full bg-foreground/20" />
					<div className="grid grid-cols-2 gap-1.5">
						<div
							className="h-6 rounded-lg"
							style={{ background: colors.primary + "22" }}
						/>
						<div
							className="h-6 rounded-lg"
							style={{ background: colors.secondary + "22" }}
						/>
					</div>
					<div className="flex gap-1.5">
						<div
							className="h-5 w-16 rounded-md"
							style={{ background: colors.primary }}
						/>
						<div
							className="h-5 w-12 rounded-md"
							style={{ background: colors.accent }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Tarjeta de preset ────────────────────────────────────────────────────────

function PresetCard({
	preset,
	isActive,
	onSelect,
}: {
	preset: BrandTheme;
	isActive: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`group relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
				isActive
					? "border-primary bg-primary/5 shadow-md"
					: "border-border hover:border-primary/40"
			}`}
		>
			{isActive && (
				<div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
					<CheckIcon className="h-3 w-3 text-white" />
				</div>
			)}
			{/* Swatches de colores */}
			<div className="flex gap-1.5">
				{[
					preset.colors.primary,
					preset.colors.secondary,
					preset.colors.accent,
					preset.colors.sidebar,
				].map((c, i) => (
					<div
						key={i}
						className="h-5 w-5 rounded-full border border-white shadow-sm"
						style={{ backgroundColor: c }}
					/>
				))}
			</div>
			<p className="text-xs font-medium leading-tight text-foreground">
				{preset.name}
			</p>
		</button>
	);
}

// ─── Color picker row ─────────────────────────────────────────────────────────

function ColorPickerRow({
	label,
	description,
	value,
	onChange,
}: {
	label: string;
	description: string;
	value: string;
	onChange: (val: string) => void;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card px-4 py-3">
			<div className="min-w-0 flex-1">
				<Label className="text-sm font-medium">{label}</Label>
				<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
			</div>
			<div className="flex items-center gap-2.5 shrink-0">
				<span className="font-mono text-xs text-muted-foreground uppercase">
					{value}
				</span>
				<label className="relative cursor-pointer">
					<div
						className="h-8 w-8 rounded-full border-2 border-white shadow-md ring-1 ring-black/10 transition-transform hover:scale-110 cursor-pointer"
						style={{ backgroundColor: value }}
					/>
					<input
						type="color"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					/>
				</label>
			</div>
		</div>
	);
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function BrandCustomizer() {
	const { theme, applyTheme, resetTheme, presets } = useBrandTheme();

	// Estado local para edición antes de guardar
	const [draft, setDraft] = useState<BrandTheme>(theme);
	const [saved, setSaved] = useState(false);

	function updateDraftColor(key: keyof BrandThemeColors, value: string) {
		const updated: BrandTheme = {
			...draft,
			name: "Personalizado",
			colors: { ...draft.colors, [key]: value },
		};
		setDraft(updated);
		// Aplicar en tiempo real para preview inmediato
		applyTheme(updated);
	}

	function selectPreset(preset: BrandTheme) {
		setDraft(preset);
		applyTheme(preset);
	}

	function handleSave() {
		applyTheme(draft);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	function handleReset() {
		setDraft(DEFAULT_THEME);
		resetTheme();
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
					<SparklesIcon className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="text-lg font-semibold">Personalización de marca</h2>
					<p className="text-sm text-muted-foreground">
						Ajusta los colores del sistema para que coincidan con la identidad
						visual de El Rincón de José. Los cambios se aplican en tiempo real.
					</p>
				</div>
			</div>

			{/* Preview en tiempo real */}
			<Card className="overflow-hidden border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Vista previa
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ThemePreview colors={draft.colors} />
					<div className="mt-3 flex flex-wrap gap-3">
						<ColorSwatch color={draft.colors.primary} label="Primary" />
						<ColorSwatch color={draft.colors.secondary} label="Secondary" />
						<ColorSwatch color={draft.colors.accent} label="Accent" />
						<ColorSwatch color={draft.colors.background} label="Fondo" />
						<ColorSwatch color={draft.colors.sidebar} label="Sidebar" />
					</div>
				</CardContent>
			</Card>

			{/* Presets */}
			<div>
				<p className="mb-3 text-sm font-semibold">Paletas predefinidas</p>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
					{presets.map((preset) => (
						<PresetCard
							key={preset.name}
							preset={preset}
							isActive={draft.name === preset.name}
							onSelect={() => selectPreset(preset)}
						/>
					))}
				</div>
			</div>

			{/* Color pickers manuales */}
			<div>
				<p className="mb-3 text-sm font-semibold">Ajuste manual de colores</p>
				<div className="space-y-2">
					<ColorPickerRow
						label="Color primario"
						description="Botones principales, énfasis, anillos de foco"
						value={draft.colors.primary}
						onChange={(v) => updateDraftColor("primary", v)}
					/>
					<ColorPickerRow
						label="Color secundario"
						description="Acciones secundarias, etiquetas de estado"
						value={draft.colors.secondary}
						onChange={(v) => updateDraftColor("secondary", v)}
					/>
					<ColorPickerRow
						label="Color de acento"
						description="Highlights, badges, elementos decorativos"
						value={draft.colors.accent}
						onChange={(v) => updateDraftColor("accent", v)}
					/>
					<ColorPickerRow
						label="Color de fondo"
						description="Fondo principal de la aplicación"
						value={draft.colors.background}
						onChange={(v) => updateDraftColor("background", v)}
					/>
					<ColorPickerRow
						label="Color del sidebar"
						description="Fondo del menú lateral de navegación"
						value={draft.colors.sidebar}
						onChange={(v) => updateDraftColor("sidebar", v)}
					/>
				</div>
			</div>

			{/* Acciones */}
			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					className="gap-2"
				>
					<RotateCcwIcon className="h-4 w-4" />
					Restaurar predeterminado
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					className="gap-2 min-w-[140px]"
				>
					{saved ? (
						<>
							<CheckIcon className="h-4 w-4" />
							¡Guardado!
						</>
					) : (
						<>
							<SaveIcon className="h-4 w-4" />
							Guardar cambios
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
