"use client";

import { useMemo, useState } from "react";
import { SearchIcon, ShieldCheckIcon, UserCheckIcon, UsersIcon } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ManagedUserItem = {
	id: string;
	name: string;
	email: string;
	createdAt: Date | string;
	roleName: string | null;
};

export function AdminUsersListView({ users }: { users: ManagedUserItem[] }) {
	const [query, setQuery] = useState("");

	const filteredUsers = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return users;

		return users.filter(
			(u) =>
				u.name.toLowerCase().includes(normalized) ||
				u.email.toLowerCase().includes(normalized) ||
				(u.roleName && u.roleName.toLowerCase().includes(normalized)),
		);
	}, [users, query]);

	return (
		<Card className="border-border/70 bg-card shadow-sm">
			<CardHeader className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="flex items-center gap-2">
							<UsersIcon className="size-5 text-primary" />
							<CardTitle className="text-xl font-bold tracking-tight text-foreground">
								Usuarios Registrados
							</CardTitle>
						</div>
						<CardDescription className="mt-1 text-sm text-muted-foreground">
							Cuentas activas en la base de datos con acceso al sistema.
						</CardDescription>
					</div>
					<span className="self-start sm:self-auto rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
						{users.length} {users.length === 1 ? "usuario" : "usuarios"}
					</span>
				</div>

				<div className="relative">
					<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar por nombre, correo o rol..."
						className="pl-9"
					/>
				</div>
			</CardHeader>

			<CardContent>
				{filteredUsers.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
						No se encontraron usuarios que coincidan con la búsqueda.
					</div>
				) : (
					<div className="divide-y divide-border/60">
						{filteredUsers.map((u) => {
							const isSuperAdmin = u.roleName?.toUpperCase() === "SUPERADMIN";
							const initials = u.name
								.split(" ")
								.filter(Boolean)
								.map((part) => part[0])
								.slice(0, 2)
								.join("")
								.toUpperCase();

							return (
								<div
									key={u.id}
									className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
								>
									<div className="flex items-center gap-3.5 min-w-0">
										<div
											className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-xs ${
												isSuperAdmin
													? "bg-primary/20 text-primary border border-primary/30"
													: "bg-blue-500/15 text-blue-400 border border-blue-500/25"
											}`}
										>
											{initials || "U"}
										</div>
										<div className="min-w-0">
											<p className="font-semibold text-foreground truncate text-base">
												{u.name}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{u.email}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
										<span
											className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${
												isSuperAdmin
													? "bg-primary/15 text-primary border border-primary/30"
													: "bg-blue-500/15 text-blue-400 border border-blue-500/30"
											}`}
										>
											{isSuperAdmin ? (
												<ShieldCheckIcon className="size-3.5" />
											) : (
												<UserCheckIcon className="size-3.5" />
											)}
											{isSuperAdmin
												? "Super Administrador"
												: "Administrador"}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
