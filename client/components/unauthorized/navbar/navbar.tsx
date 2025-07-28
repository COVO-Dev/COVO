"use client";
import { Info, Search, Home, List, Hotel } from "lucide-react";
import { NavbarDes } from "./navbarDes";
import { NavbarItems } from "@/types";
import { NavbarMob } from "./navbarMob";

const navbarItems: NavbarItems = {
  links: [

    { label: "Demo", href: "/#demo" },
     { label: "How it Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],

};

const navbarItemsMobile: NavbarItems = {
	links: [
    { label: "Demo", href: "/#demo" },
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
	],
};

export function Navbar() {
	return (
		<div className="h-[100px]">
			<NavbarDes navbarItems={navbarItems} />
			<NavbarMob navbarItems={navbarItemsMobile} />
		</div>
	);
}
