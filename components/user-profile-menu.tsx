"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type UserProfileMenuProps = {
	name: string;
	email: string;
	role: string;
};

export function UserProfileMenu({ name, email, role }: UserProfileMenuProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/login");
		router.refresh();
	}

	return (
		<div className="relative flex flex-col items-end">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-left shadow-lg shadow-amber-950/5 transition hover:bg-white dark:border-white/10 dark:bg-zinc-950/80 dark:hover:bg-zinc-900"
				aria-label="Abrir menú de perfil"
			>
				<div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-purple-500 text-sm font-bold text-white">
					{name.charAt(0).toUpperCase()}
				</div>
				<div className="hidden text-left sm:block">
					<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{name}</p>
					<p className="text-xs text-muted-foreground">{role}</p>
				</div>
				<ChevronDown className="size-4 text-zinc-500" />
			</button>

			{open ? (
				<div className="z-20 mt-3 w-64 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:bg-zinc-950/90">
					<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/80">
						<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{name}</p>
						<p className="mt-1 text-xs text-muted-foreground">{email}</p>
					</div>

					<div className="mt-2 space-y-1">
						<Link
							href="/perfil"
							className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
							onClick={() => setOpen(false)}
						>
							<UserRound className="size-4" />
							Perfil
						</Link>
						<Link
							href="/ajustes"
							className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
							onClick={() => setOpen(false)}
						>
							<Settings className="size-4" />
							Ajustes
						</Link>
						<button
							type="button"
							onClick={handleSignOut}
							className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20"
						>
							<LogOut className="size-4" />
							Cerrar sesión
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
