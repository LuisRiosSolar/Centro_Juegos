import Image from "next/image";
import Link from "next/link";
import { LayoutDashboardIcon, MonitorIcon, TimerIcon } from "lucide-react";

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

export function AdminSidebar({
	userName,
	active,
}: {
	userName: string;
	active: "panel" | "planes";
}) {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
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
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									render={<Link href="/admin" />}
									isActive={active === "panel"}
								>
									<LayoutDashboardIcon />
									<span>Panel</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton render={<Link href="/sesiones" />}>
									<MonitorIcon />
									<span>Sesiones</span>
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
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
