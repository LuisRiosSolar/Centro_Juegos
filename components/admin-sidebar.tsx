"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ChevronsUpDownIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	MonitorIcon,
	ReceiptTextIcon,
	TimerIcon,
	UserRoundIcon,
	UsersIcon,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function AdminSidebar({
	userName,
	userEmail,
	isRoot = false,
	active,
}: {
	userName: string;
	userEmail: string;
	isRoot?: boolean;
	active: "panel" | "planes" | "usuarios" | "reportes";
}) {
	const router = useRouter();

	async function handleSignOut() {
		await authClient.signOut();
		router.replace("/login");
		router.refresh();
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="group-data-[collapsible=icon]:hidden">
				<div className="flex items-center gap-3 px-2 py-2">
					<Image
						className="size-10 rounded-xl object-cover"
						src="/logo.jpg"
						alt="Logo"
						width={64}
						height={64}
					/>
					<div className="min-w-0">
						<p className="truncate font-medium">El Rincón de José</p>
						<p className="truncate text-xs text-muted-foreground">{userName}</p>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Administración</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-2">
							<SidebarMenuItem>
								<SidebarMenuButton
									render={<Link href="/admin" />}
									isActive={active === "panel"}
								>
									<LayoutDashboardIcon />
									<span>Inicio</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton render={<Link href="/sesiones" />}>
									<MonitorIcon />
									<span>Sesiones activas</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							{isRoot ? (
								<>
									<SidebarMenuItem>
										<SidebarMenuButton
											render={<Link href="/admin/reportes" />}
											isActive={active === "reportes"}
										>
											<ReceiptTextIcon />
											<span>Reporte de sesiones</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											render={<Link href="/admin/planes" />}
											isActive={active === "planes"}
										>
											<TimerIcon />
											<span>Planes</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton
											render={<Link href="/admin/usuarios" />}
											isActive={active === "usuarios"}
										>
											<UsersIcon />
											<span>Usuarios</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</>
							) : null}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton size="lg">
										<UserRoundIcon />
										<div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
											<span className="truncate font-medium">{userName}</span>
											<span className="truncate text-xs text-muted-foreground">
												{userEmail}
											</span>
										</div>
										<ChevronsUpDownIcon className="ml-auto" />
									</SidebarMenuButton>
								}
							/>
							<DropdownMenuContent align="start" side="top" className="w-56">
								<DropdownMenuGroup>
									<DropdownMenuLabel className="space-y-1 py-2">
										<p className="truncate text-sm font-medium text-foreground">
											{userName}
										</p>
										<p className="truncate font-normal">{userEmail}</p>
									</DropdownMenuLabel>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
									<LogOutIcon />
									Cerrar sesión
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
