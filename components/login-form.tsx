"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";


export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginFormValues) {
		setFormError(null);

		const parsed = loginSchema.safeParse(values);

		if (!parsed.success) {
			const issue = parsed.error.issues.find((item) => {
				const field = item.path[0];

				return field === "email" || field === "password";
			});
			const field = issue?.path[0];

			if (issue && (field === "email" || field === "password")) {
				setError(field, { message: issue.message });
			}

			return;
		}

		const { error } = await authClient.signIn.email({
			email: parsed.data.email,
			password: parsed.data.password,
			callbackURL: "/",
		});

		if (error) {
			setFormError(error.message ?? "No se pudo iniciar sesión");
			return;
		}

		router.push("/");
		router.refresh();
	}

	return (
		<div className={cn("flex flex-col", className)} {...props}>
			{/* Card oscura con gradiente de marca — fondo de página es blanco */}
			<div
				className="overflow-hidden rounded-2xl backdrop-blur-2xl"
				style={{
					background: "linear-gradient(150deg, #0d0a1e 0%, #1a0835 40%, #0e1f3d 80%, #071428 100%)",
					boxShadow: "0 32px_80px_rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.10)",
				}}
			>
				{/* Header */}
				<div className="flex flex-col items-center gap-4 px-8 pt-8 text-center">
					<div className="relative mx-auto flex justify-center">
						<div
							className="absolute inset-0 rounded-3xl blur-2xl"
							style={{ background: "rgba(255,107,0,0.50)" }}
						/>
						<Image
							className="relative mx-auto size-20 rounded-3xl border border-white/20 object-cover shadow-2xl"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={96}
							height={96}
							priority
						/>
					</div>
					<div className="space-y-1.5">
						<p
							className="text-xs font-semibold uppercase tracking-[0.35em]"
							style={{ color: "#FF6B00" }}
						>
							Acceso administrativo
						</p>
						<h1 className="text-3xl font-semibold tracking-tight text-white">
							El Rincón de José
						</h1>
						<p className="text-balance text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
							Gestiona registros, tiempos y pagos del centro de juegos.
						</p>
					</div>
				</div>

				{/* Form */}
				<div className="px-8 pb-8 pt-6">
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<div className="flex flex-col gap-4">
							{formError ? (
								<div className="rounded-xl border px-4 py-3" style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.15)" }}>
									<p className="text-sm font-medium" style={{ color: "#fca5a5" }}>{formError}</p>
								</div>
							) : null}

							{/* Campo correo */}
							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="email"
									className="text-sm font-medium"
									style={{ color: "rgba(255,255,255,0.80)" }}
								>
									Correo
								</label>
								<input
									id="email"
									type="email"
									placeholder="jose@example.com"
									autoComplete="email"
									aria-invalid={!!errors.email}
									{...register("email")}
									className="h-11 w-full rounded-xl px-3.5 text-sm outline-none transition"
									style={{
										background: "rgba(255,255,255,0.08)",
										border: errors.email ? "1px solid rgba(239,68,68,0.7)" : "1px solid rgba(255,255,255,0.18)",
										color: "#ffffff",
										...(errors.email ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.25)" } : {}),
									}}
									onFocus={(e) => {
										e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,107,0,0.45)";
										e.currentTarget.style.borderColor = "#FF6B00";
									}}
									onBlur={(e) => {
										if (!errors.email) {
											e.currentTarget.style.boxShadow = "";
											e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
										}
									}}
								/>
								{errors.email && (
									<p className="text-xs text-red-500">{errors.email.message}</p>
								)}
							</div>

							{/* Campo contraseña */}
							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="password"
									className="text-sm font-medium"
									style={{ color: "rgba(255,255,255,0.80)" }}
								>
									Contraseña
								</label>
								<input
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
									aria-invalid={!!errors.password}
									{...register("password")}
									className="h-11 w-full rounded-xl px-3.5 text-sm outline-none transition"
									style={{
										background: "rgba(255,255,255,0.08)",
										border: errors.password ? "1px solid rgba(239,68,68,0.7)" : "1px solid rgba(255,255,255,0.18)",
										color: "#ffffff",
										...(errors.password ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.25)" } : {}),
									}}
									onFocus={(e) => {
										e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,107,0,0.45)";
										e.currentTarget.style.borderColor = "#FF6B00";
									}}
									onBlur={(e) => {
										if (!errors.password) {
											e.currentTarget.style.boxShadow = "";
											e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
										}
									}}
								/>
								{errors.password && (
									<p className="text-xs text-red-500">{errors.password.message}</p>
								)}
							</div>

							{/* Botón */}
							<div className="flex flex-col gap-3 pt-1">
								<button
									type="submit"
									disabled={isSubmitting}
									className="h-11 w-full rounded-xl font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
									style={{
										background: "linear-gradient(135deg, #FF6B00 0%, #ff8c38 100%)",
										boxShadow: "0 4px 20px rgba(255,107,0,0.45)",
									}}
								>
									{isSubmitting ? "Entrando..." : "Entrar"}
								</button>
								<p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
									🔒 Acceso exclusivo para personal autorizado.
								</p>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

