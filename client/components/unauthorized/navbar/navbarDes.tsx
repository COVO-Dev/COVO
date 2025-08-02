import { NavbarButton } from "./navbar-button";
import { NavbarItems } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface NavbarProps {
	navbarItems: NavbarItems;
}

export function NavbarDes(props: NavbarProps) {
	const pathname = usePathname();
	const router = useRouter();

	// Custom handler for anchor links to ensure proper URL display
	const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId: string) => {
		e.preventDefault();

		
		if (pathname === '/Home') {
			const section = document.getElementById(sectionId);
			if (section) {
			
				window.history.pushState({}, '', href);
				
				section.scrollIntoView({ behavior: 'smooth' });
			}
		} else {
			
			router.push(href);
		}
	};

	return (
	
		<nav className="w-full fixed z-50 bg-white border-b border-gray-100 hidden lg:block">
			<div className="h-[100px] flex justify-between items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				{/* logo */}
				<Link href="/" className="flex items-center">
					<Image
						src="/images/COVO_LOGOGRAM_BLACK.png"
						alt="COVO"
						className="h-25 w-auto transition-transform duration-200 hover:scale-105"
						width={250}
						height={60}
						priority
					/>
				</Link>

				{/* links of the pages */}
				<div className="flex items-center space-x-6 xl:space-x-8">
					{props.navbarItems.links.map((link, index) => {
						const isAnchorLink = link.href.startsWith('/#');
						const sectionId = isAnchorLink ? link.href.substring(2) : '';

						return (
							<Link
								key={index}
								href={link.href}
								onClick={isAnchorLink ? (e) => handleAnchorClick(e, link.href, sectionId) : undefined}
								className={`text-gray-700 hover:text-gray-900 font-semibold text-base xl:text-lg transition-all duration-200 hover:scale-105 whitespace-nowrap ${
									pathname === link.href || (isAnchorLink && pathname === "/Home") ? "text-gray-900 font-bold" : ""
								}`}
							>
								{link.label}
							</Link>
						);
					})}
				</div>

				{/* auth buttons */}
				<div className="flex items-center space-x-2 xl:space-x-3">
					<Link href="/login">
						<Button
							variant="outline"
							className="text-gray-700 hover:text-gray-900 font-normal text-sm border-gray-300 px-3 xl:px-4 py-2 h-9 transition-all duration-200 hover:scale-105"
						>
							Log In
						</Button>
					</Link>
					<Link href="/signup">
						<Button
							className="bg-black hover:bg-gray-800 text-white font-normal text-sm px-3 xl:px-4 py-2 h-9 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
						>
							Sign Up
						</Button>
					</Link>
				</div>
			</div>
		</nav>
	);
}
