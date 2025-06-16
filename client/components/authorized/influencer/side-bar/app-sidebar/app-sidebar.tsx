"use client";
import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { CovoLogo } from "../covo-logo/CovoLogo";
import { NavMain } from "../nav/nav-main";
import { NavUser } from "../nav/nav-user";
import { navbarData } from "./app-sidebar.data";

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
