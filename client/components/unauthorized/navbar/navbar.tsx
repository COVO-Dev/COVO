"use client";
import { Info, Search, Home, List, Hotel } from "lucide-react";
import { NavbarDes } from "./navbarDes";
import { NavbarItems } from "@/types";
import { NavbarMob } from "./navbarMob";

const navbarItems: NavbarItems = {
  links: [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Benefits", href: "/#benefits" },
    { label: "Features", href: "/#features" },
    { label: "FAQ", href: "/#faq" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact", href: "#contact" },
  ],

};

const navbarItemsMobile: NavbarItems = {
	links: [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Benefits", href: "/#benefits" },
    { label: "Features", href: "/#features" },
    { label: "FAQ", href: "/#faq" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact", href: "#contact" },
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
