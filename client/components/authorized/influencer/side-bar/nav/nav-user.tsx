"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAppSelector } from "@/lib/store/hooks";
import Link from "next/link";

export function NavUser() {
	const { isMobile } = useSidebar();
	const user = useAppSelector((state) => state.profile);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								{/* <Image src={user?.avatar ?? undefined} alt={user.firstName} /> */}
								<AvatarFallback className="rounded-lg">
									{user.firstName.slice(0, 2).toLocaleUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{`${user.firstName} ${user.lastName}`}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{/* <AvatarImage src={user.avatar} alt={user.firstName} /> */}
									<AvatarFallback className="rounded-lg">
										{user.firstName.slice(0, 2).toLocaleUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{`${user.firstName} ${user.lastName}`}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						{/* <DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles />
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator /> */}
						<DropdownMenuGroup>
							<Link href="/influencer/profile">
								<DropdownMenuItem>
									<BadgeCheck />
									Profile
								</DropdownMenuItem>
							</Link>
							{/* <DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem> */}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
