import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function LoginPage() {
	const access = await getCurrentUserAccess();

	if (access.ok) {
		if (access.isRoot || access.isAdmin) {
			redirect("/admin");
		}
		redirect("/sesiones");
	}

	return (
		<main
			className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-6"
			style={{ background: "#ffffff" }}
		>
			{/* ── Decoraciones sobre fondo blanco ─────────────────────────── */}
			<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">

				{/* Orbes de color — más opacos para que se noten sobre blanco */}
				<div
					className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-25 blur-[100px]"
					style={{ background: "radial-gradient(circle, #FF6B00 0%, transparent 70%)" }}
				/>
				<div
					className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[110px]"
					style={{ background: "radial-gradient(circle, #4CAF1A 0%, transparent 70%)" }}
				/>
				<div
					className="absolute right-[8%] top-[15%] h-[380px] w-[380px] rounded-full opacity-18 blur-[90px]"
					style={{ background: "radial-gradient(circle, #00B8A9 0%, transparent 70%)" }}
				/>
				<div
					className="absolute left-[10%] bottom-[10%] h-[320px] w-[320px] rounded-full opacity-20 blur-[80px]"
					style={{ background: "radial-gradient(circle, #7B2FBE 0%, transparent 70%)" }}
				/>
				<div
					className="absolute left-[40%] top-[5%] h-[250px] w-[250px] rounded-full opacity-15 blur-[80px]"
					style={{ background: "radial-gradient(circle, #FF3D9A 0%, transparent 70%)" }}
				/>

				{/* ── Puntos decorativos — sólidos y vibrantes sobre blanco ── */}
				<div className="absolute top-[7%]  left-[11%]  h-5  w-5  rounded-full" style={{ background: "#FF6B00", opacity: 0.7 }} />
				<div className="absolute top-[13%] left-[21%]  h-3.5 w-3.5 rounded-full" style={{ background: "#FFD600", opacity: 0.65 }} />
				<div className="absolute top-[5%]  right-[17%] h-6  w-6  rounded-full" style={{ background: "#4CAF1A", opacity: 0.65 }} />
				<div className="absolute top-[17%] right-[9%]  h-4  w-4  rounded-full" style={{ background: "#00B8A9", opacity: 0.55 }} />
				<div className="absolute top-[9%]  right-[29%] h-3  w-3  rounded-full" style={{ background: "#FF3D9A", opacity: 0.60 }} />
				<div className="absolute top-[22%] left-[5%]   h-3  w-3  rounded-full" style={{ background: "#FFD600", opacity: 0.50 }} />

				<div className="absolute top-[44%] left-[5%]   h-4  w-4  rounded-full" style={{ background: "#7B2FBE", opacity: 0.55 }} />
				<div className="absolute top-[54%] right-[6%]  h-5  w-5  rounded-full" style={{ background: "#FF6B00", opacity: 0.60 }} />
				<div className="absolute top-[38%] right-[3%]  h-3  w-3  rounded-full" style={{ background: "#4CAF1A", opacity: 0.50 }} />

				<div className="absolute bottom-[11%] left-[17%]  h-5 w-5   rounded-full" style={{ background: "#FFD600", opacity: 0.65 }} />
				<div className="absolute bottom-[19%] left-[7%]   h-3.5 w-3.5 rounded-full" style={{ background: "#00B8A9", opacity: 0.55 }} />
				<div className="absolute bottom-[7%]  right-[21%] h-6 w-6   rounded-full" style={{ background: "#FF3D9A", opacity: 0.60 }} />
				<div className="absolute bottom-[15%] right-[11%] h-3.5 w-3.5 rounded-full" style={{ background: "#4CAF1A", opacity: 0.50 }} />
				<div className="absolute bottom-[25%] right-[25%] h-3 w-3   rounded-full" style={{ background: "#7B2FBE", opacity: 0.45 }} />

				{/* ── Figuras geométricas — más visibles sobre blanco ──────── */}
				{/* Triángulo — superior izquierdo */}
				<svg className="absolute left-[4%] top-[4%] opacity-30" width="130" height="130" viewBox="0 0 120 120" fill="none">
					<polygon points="60,10 110,100 10,100" stroke="#FF6B00" strokeWidth="2.5" fill="none" />
					<polygon points="60,32 88,82 32,82"  stroke="#FF6B00" strokeWidth="1.5" fill="none" opacity="0.5" />
				</svg>
				{/* Círculo doble — derecha medio */}
				<svg className="absolute right-[3%] top-[28%] opacity-25" width="180" height="180" viewBox="0 0 160 160" fill="none">
					<circle cx="80" cy="80" r="72" stroke="#00B8A9" strokeWidth="2.5" />
					<circle cx="80" cy="80" r="52" stroke="#00B8A9" strokeWidth="1.5" opacity="0.5" />
				</svg>
				{/* Rombo — inferior izquierdo */}
				<svg className="absolute left-[2%] bottom-[6%] opacity-25" width="110" height="110" viewBox="0 0 100 100" fill="none">
					<rect x="14" y="14" width="72" height="72" rx="4" stroke="#7B2FBE" strokeWidth="2.5" transform="rotate(45 50 50)" />
				</svg>
				{/* Estrella / burst — superior derecha */}
				<svg className="absolute right-[7%] top-[5%] opacity-30" width="90" height="90" viewBox="0 0 80 80" fill="none">
					<line x1="40" y1="4"  x2="40" y2="76" stroke="#FFD600" strokeWidth="2" />
					<line x1="4"  y1="40" x2="76" y2="40" stroke="#FFD600" strokeWidth="2" />
					<line x1="14" y1="14" x2="66" y2="66" stroke="#FFD600" strokeWidth="1.5" />
					<line x1="66" y1="14" x2="14" y2="66" stroke="#FFD600" strokeWidth="1.5" />
				</svg>
				{/* Cruz pequeña — izquierda medio */}
				<svg className="absolute left-[7%] top-[48%] opacity-20" width="50" height="50" viewBox="0 0 50 50" fill="none">
					<line x1="25" y1="5"  x2="25" y2="45" stroke="#FF3D9A" strokeWidth="2" />
					<line x1="5"  y1="25" x2="45" y2="25" stroke="#FF3D9A" strokeWidth="2" />
				</svg>
				{/* Hexágono — inferior derecho */}
				<svg className="absolute right-[5%] bottom-[20%] opacity-20" width="90" height="90" viewBox="0 0 90 90" fill="none">
					<polygon points="45,5 80,22.5 80,67.5 45,85 10,67.5 10,22.5" stroke="#4CAF1A" strokeWidth="2.5" fill="none" />
				</svg>

				{/* ── Grilla de puntos — más oscura sobre blanco ───────────── */}
				<svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern id="dots-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
							<circle cx="1" cy="1" r="1.2" fill="#1a1a2e" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#dots-grid)" />
				</svg>

				{/* ── Ondas multicolor inferiores — más saturadas ──────────── */}
				<svg
					className="absolute bottom-0 left-0 w-full opacity-40"
					viewBox="0 0 1440 130"
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M0,70 C240,120 480,20 720,70 C960,120 1200,20 1440,70 L1440,130 L0,130 Z" fill="#FF6B00" />
					<path d="M0,88 C240,38 480,138 720,88 C960,38 1200,138 1440,88 L1440,130 L0,130 Z" fill="#4CAF1A" opacity="0.75" />
					<path d="M0,104 C360,74 720,130 1080,84 C1260,64 1380,110 1440,104 L1440,130 L0,130 Z" fill="#00B8A9" opacity="0.6" />
				</svg>

				{/* Velo radial suave para enfocar el centro sin oscurecer */}
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse 55% 65% at 50% 50%, transparent 35%, rgba(200,210,230,0.25) 100%)",
					}}
				/>
			</div>

			{/* ── Card de login ─────────────────────────────────────────────── */}
			<section className="relative z-10 mx-auto flex w-full max-w-md items-center justify-center">
				<LoginForm className="w-full" />
			</section>
		</main>
	);
}
