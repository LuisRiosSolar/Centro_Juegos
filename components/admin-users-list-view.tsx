"use client";

import { useMemo, useState, useTransition } from "react";
import {
	Edit3Icon,
	KeyRoundIcon,
	MailIcon,
	SearchIcon,
	ShieldCheckIcon,
	Trash2Icon,
	UserCheckIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { deleteManagedUser, updateManagedUser } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UpdateManagedUserValues } from "@/lib/auth-schemas";

export type ManagedUserItem = {
	id: string;
	name: string;
	email: string;
	createdAt: Date | string;
	roleName: string | null;
};

export function AdminUsersListView({
	users,
	currentUserId,
}: {
	users: ManagedUserItem[];
	currentUserId?: string;
}) {
	const [query, setQuery] = useState("");
	const [userToEdit, setUserToEdit] = useState<ManagedUserItem | null>(null);
	const [userToDelete, setUserToDelete] = useState<ManagedUserItem | null>(null);

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
		<>
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
								Cuentas autorizadas para operar y administrar el centro de juegos.
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
							className="pl-9 h-10 rounded-xl bg-card border-border/80"
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
								const isCurrentUser = u.id === currentUserId;
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
										className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
									>
										<div className="flex items-center gap-3.5 min-w-0">
											<div
												className={`flex size-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-xs ${
													isSuperAdmin
														? "bg-primary/20 text-primary border border-primary/30"
														: "bg-blue-500/15 text-blue-500 border border-blue-500/25"
												}`}
											>
												{initials || "U"}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<p className="font-bold text-foreground truncate text-base">
														{u.name}
													</p>
													{isCurrentUser && (
														<span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
															Tú
														</span>
													)}
												</div>
												<p className="text-xs text-muted-foreground truncate">
													{u.email}
												</p>
											</div>
										</div>

										<div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
											<span
												className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold ${
													isSuperAdmin
														? "bg-primary/15 text-primary border border-primary/30"
														: "bg-blue-500/15 text-blue-500 border border-blue-500/30"
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

											{/* Botón Editar */}
											<Button
												variant="outline"
												size="sm"
												onClick={() => setUserToEdit(u)}
												className="h-8 gap-1.5 text-xs font-semibold rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5"
												title="Editar usuario o restablecer contraseña"
											>
												<Edit3Icon className="size-3.5 text-primary" />
												Editar
											</Button>

											{/* Botón Eliminar */}
											<Button
												variant="destructive"
												size="sm"
												disabled={isCurrentUser}
												onClick={() => setUserToDelete(u)}
												className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
												title={
													isCurrentUser
														? "No puedes eliminar tu propia cuenta"
														: "Eliminar usuario"
												}
											>
												<Trash2Icon className="size-3.5" />
												Eliminar
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* ── Modal de Edición de Usuario ── */}
			{userToEdit && (
				<EditUserModal
					user={userToEdit}
					open={!!userToEdit}
					onClose={() => setUserToEdit(null)}
				/>
			)}

			{/* ── Modal de Confirmación de Eliminación ── */}
			{userToDelete && (
				<DeleteUserModal
					user={userToDelete}
					open={!!userToDelete}
					onClose={() => setUserToDelete(null)}
				/>
			)}
		</>
	);
}

// ─── Modal de Edición / Cambio de Contraseña ────────────────────────────────
function EditUserModal({
	user,
	open,
	onClose,
}: {
	user: ManagedUserItem;
	open: boolean;
	onClose: () => void;
}) {
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState<"admin" | "superadmin">(
		user.roleName?.toUpperCase() === "SUPERADMIN" ? "superadmin" : "admin",
	);
	const [newPassword, setNewPassword] = useState("");
	const [isPending, startTransition] = useTransition();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("El nombre no puede estar vacío");
			return;
		}

		if (!email.trim() || !email.includes("@")) {
			toast.error("Ingresa un correo electrónico válido");
			return;
		}

		if (newPassword && newPassword.length < 8) {
			toast.error("La nueva contraseña debe tener al menos 8 caracteres");
			return;
		}

		startTransition(async () => {
			const payload: UpdateManagedUserValues = {
				userId: user.id,
				name: name.trim(),
				email: email.trim().toLowerCase(),
				role,
				newPassword: newPassword.trim() || undefined,
			};

			const response = await updateManagedUser(payload);

			if (response.ok) {
				toast.success(response.message);
				onClose();
			} else {
				toast.error(response.message);
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
				<form onSubmit={handleSubmit}>
					<DialogHeader className="p-5 pb-4 border-b">
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Edit3Icon className="size-4.5" />
							</div>
							<div>
								<DialogTitle className="text-lg font-bold">
									Editar Usuario
								</DialogTitle>
								<DialogDescription className="text-xs">
									Modifica los datos del usuario o restablece su contraseña.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="p-5 space-y-4 text-sm">
						{/* Nombre */}
						<div className="space-y-1.5">
							<Label htmlFor="edit-name" className="text-xs font-semibold flex items-center gap-1.5">
								<UserIcon className="size-3.5 text-primary" />
								Nombre completo
							</Label>
							<Input
								id="edit-name"
								value={name}
								onChange={(e) =>
									setName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ""))
								}
								placeholder="Nombre del usuario"
								className="h-10 rounded-xl"
								required
							/>
						</div>

						{/* Correo */}
						<div className="space-y-1.5">
							<Label htmlFor="edit-email" className="text-xs font-semibold flex items-center gap-1.5">
								<MailIcon className="size-3.5 text-primary" />
								Correo electrónico
							</Label>
							<Input
								id="edit-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="usuario@ejemplo.com"
								className="h-10 rounded-xl"
								required
							/>
						</div>

						{/* Rol */}
						<div className="space-y-1.5">
							<Label htmlFor="edit-role" className="text-xs font-semibold flex items-center gap-1.5">
								<ShieldCheckIcon className="size-3.5 text-primary" />
								Rol del usuario
							</Label>
							<Select
								value={role}
								onValueChange={(val) => setRole(val as "admin" | "superadmin")}
							>
								<SelectTrigger
									id="edit-role"
									className="!h-10 !w-full rounded-xl bg-card border-border/80 px-3 flex items-center justify-between text-sm shadow-2xs hover:border-primary/50 transition-all"
								>
									<SelectValue>
										{(val) =>
											val === "superadmin"
												? "Super Administrador"
												: "Administrador"
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									<SelectItem value="admin" className="rounded-lg text-sm">
										Administrador
									</SelectItem>
									<SelectItem value="superadmin" className="rounded-lg text-sm">
										Super Administrador
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Restablecer Contraseña */}
						<div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
							<Label htmlFor="edit-password" className="text-xs font-bold text-foreground flex items-center gap-1.5">
								<KeyRoundIcon className="size-3.5 text-primary" />
								Restablecer contraseña (opcional)
							</Label>
							<Input
								id="edit-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Nueva contraseña (mínimo 8 caracteres)"
								className="h-10 rounded-xl bg-card border-border/80"
								autoComplete="new-password"
							/>
							<p className="text-[11px] text-muted-foreground">
								<center>Si el usuario olvidó su contraseña, ingresa una nueva aquí.</center>
								<br />
								<center>Déjalo en blanco para no cambiarla.</center>
							</p>
						</div>
					</div>

					<DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
							className="h-10 rounded-xl px-5 text-xs font-semibold border-border/80 hover:bg-muted/60"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="h-10 rounded-xl px-6 text-xs font-bold shadow-sm"
						>
							{isPending ? "Guardando..." : "Guardar Cambios"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ─── Modal de Confirmación de Eliminación ───────────────────────────────────
function DeleteUserModal({
	user,
	open,
	onClose,
}: {
	user: ManagedUserItem;
	open: boolean;
	onClose: () => void;
}) {
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			const response = await deleteManagedUser(user.id);

			if (response.ok) {
				toast.success(response.message);
				onClose();
			} else {
				toast.error(response.message);
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
				<DialogHeader className="p-5 pb-4 border-b bg-destructive/5">
					<div className="flex items-center gap-2 text-destructive">
						<div className="flex size-9 items-center justify-center rounded-xl bg-destructive/15">
							<Trash2Icon className="size-4.5" />
						</div>
						<div>
							<DialogTitle className="text-lg font-bold text-destructive">
								Eliminar Usuario
							</DialogTitle>
							<DialogDescription className="text-xs">
								Esta acción eliminará el acceso del usuario al sistema.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="p-5 space-y-3 text-sm">
					<p className="text-foreground">
						¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
						<strong>{user.name}</strong> (<em>{user.email}</em>)?
					</p>
					<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-muted-foreground">
						⚠️ Las sesiones y registros históricos creados por este usuario se reasignarán a tu cuenta de superadministrador para mantener la integridad contable y de reportes.
					</div>
				</div>

				<DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/60 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isPending}
						className="h-10 rounded-xl px-5 text-xs font-semibold border-border/80 hover:bg-muted/60"
					>
						Cancelar
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
						className="h-10 rounded-xl px-6 text-xs font-bold shadow-sm"
					>
						{isPending ? "Eliminando..." : "Sí, eliminar usuario"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
