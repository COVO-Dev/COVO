"use client";
import * as React from "react";
import { navbarData } from "@/components/authorized/brand/side-bar/app-sidebar/app-sidebar.data";
import { NavMain } from "@/components/authorized/brand/side-bar/nav/nav-main";
import { NavUser } from "@/components/authorized/brand/side-bar/nav/nav-user";
import { CovoLogo } from "@/components/authorized/brand/side-bar/covo-logo/CovoLogo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<CovoLogo />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navbarData} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
