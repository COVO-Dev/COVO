import { NavbarButton } from "./navbar-button";
import { NavbarItems } from "@/types";
import Link from "next/link";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, UserCog, UserRoundPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet"
import { ListPlus } from 'lucide-react';
import { Separator } from "@/components/ui/separator";



interface NavbarProps {
	navbarItems: NavbarItems;
}

export function NavbarMob(props: NavbarProps) {
	const pathname = usePathname();

	return (
		/* navbar */
		<aside className="w-full fixed z-50 bg-custom-light-grayish-blue2/70  lg:hidden">
			<div className="h-[100px] flex justify-between items-center ">
				{/* logo */}
				<Image
					src="/images/COVO_LOGOGRAM_BLACK.png"
					alt="logo"
					className=" opacity-[0.8]"
					width={200}
					height={100}
					priority
				/>



				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" className="m-5">
							<ListPlus />

						</Button>
					</SheetTrigger>
					<SheetContent className="w-[300px]">
						{/* links of the pages */}
						<div className="flex flex-col gap-1 ">
							{props.navbarItems.links.map((link, index) => (
								<Link key={index} href={link.href}>
									<NavbarButton
										variant={"none"}
										className={`w-full ${pathname === link.href ? "text-custom-dark-gray" : ""
											}`}
										icon={link.icon}
									>
										{link.label}
									</NavbarButton>
								</Link>
							))}
						</div>
						<Separator />

						<div className="space-y-1 text-black">
							<Link href="/login">
								<NavbarButton
									size="sm"
									className="group w-full hover:bg-custom-dark-gray"
								>
									<div className="flex justify-between ">
										<LogOut
											className="group-hover:text-custom-light-apricot text-black mt-[5px]"
											size={20}
										/>
										<p
											className={`text-black group-hover:text-custom-light-apricot pl-2`}
										>
											Log In
										</p>
									</div>
								</NavbarButton>
							</Link>
							<Link href="/signup">
								<NavbarButton
									size="sm"
									className="group w-full hover:bg-custom-dark-gray"
								>
									<div className="flex justify-between ">
										<UserRoundPlus
											className="group-hover:text-custom-light-apricot text-black mt-[5px]"
											size={20}
										/>
										<p
											className={`text-black group-hover:text-custom-light-apricot pl-2`}
										>
											Sign Up
										</p>
									</div>
								</NavbarButton>
							</Link>
						</div>
					</SheetContent>
				</Sheet>
























			</div>
		</aside>
	);
}
