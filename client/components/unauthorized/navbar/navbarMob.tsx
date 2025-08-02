import { NavbarItems } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
	SheetClose,
} from "@/components/ui/sheet"
import { Menu, Loader2, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface NavbarProps {
	navbarItems: NavbarItems;
}

export function NavbarMob(props: NavbarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);

	// Custom handler for anchor links to ensure proper URL display
	const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId: string) => {
		e.preventDefault();

		// Set navigating state
		setIsNavigating(true);

		// Close the sidebar first with animation
		setIsOpen(false);

		// Wait for closing animation to complete before navigation
		setTimeout(() => {
			// If we're on the Home page, just scroll to the section
			if (pathname === '/Home') {
				const section = document.getElementById(sectionId);
				if (section) {
					// Update URL to show the anchor
					window.history.pushState({}, '', href);
					// Smooth scroll to the section
					section.scrollIntoView({ behavior: 'smooth' });
					// Reset navigating state after scroll
					setTimeout(() => setIsNavigating(false), 800);
				}
			} else {
				// If we're on a different page, navigate to the anchor
				router.push(href);
				// Reset navigating state after navigation
				setTimeout(() => setIsNavigating(false), 1000);
			}
		}, 350); // Increased delay to allow full closing animation (300ms + buffer)
	};

	// Handle regular navigation links (non-anchor)
	const handleNavigationClick = () => {
		setIsNavigating(true);
		setIsOpen(false);
		// Reset navigating state after animation completes
		setTimeout(() => setIsNavigating(false), 1200);
	};

	// Handle escape key to close sidebar
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen]);

	return (
		/* navbar */
		<nav className="w-full fixed z-50 bg-white border-b border-gray-100 lg:hidden">
			<div className="h-[100px] flex justify-between items-center px-4 sm:px-6">
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

				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={`group relative transition-all duration-300 hover:scale-110 hover:bg-gray-100/80 active:scale-95 hover:shadow-lg hover:shadow-gray-200/50 rounded-xl ${
								isOpen ? 'bg-gray-100 scale-105 shadow-md' : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'
							}`}
							onClick={() => setIsOpen(true)}
						>
							{/* Subtle background hover effect */}
							<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-15 transition-opacity duration-300" />

							{isNavigating && !isOpen ? (
								<Loader2 className="h-6 w-6 animate-spin text-gray-700 relative z-10" />
							) : (
								<Menu className={`h-6 w-6 transition-all duration-300 ease-out relative z-10 text-gray-700 group-hover:text-gray-900 ${
									isOpen ? 'rotate-90 scale-110' : 'group-hover:rotate-12 group-hover:scale-105'
								}`} />
							)}
						</Button>
					</SheetTrigger>
					<SheetContent
						side="right"
						hideCloseButton={true}
						className="w-[320px] sm:w-[350px] border-l border-gray-50 bg-white backdrop-blur-xl shadow-2xl shadow-gray-900/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-500 data-[state=closed]:duration-300"
						style={{
							animationTimingFunction: isOpen
								? 'cubic-bezier(0.16, 1, 0.3, 1)'
								: 'cubic-bezier(0.7, 0, 0.84, 0)'
						}}
					>
						{/* Subtle gradient overlay for visual depth */}
						<div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none" />

						<SheetTitle className="sr-only">Navigation Menu</SheetTitle>

						{/* Enhanced header with logo */}
						<div
							className={`flex items-center justify-between mb-8 pt-2 transition-all duration-700 ease-out ${
								isOpen ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
							}`}
							style={{
								transitionDelay: isOpen ? '200ms' : '0ms',
								transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
							}}
						>
							<Image
								src="/images/COVO_LOGOGRAM_BLACK.png"
								alt="COVO"
								className="h-8 w-auto"
								width={120}
								height={32}
								priority
							/>
							<SheetClose className="group rounded-xl p-2.5 opacity-70 ring-offset-background transition-all duration-500 hover:opacity-100 hover:scale-110 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:shadow-lg">
								<X className="h-5 w-5 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110 text-gray-600 group-hover:text-gray-900" />
								<span className="sr-only">Close</span>
							</SheetClose>
						</div>

						<div
							className={`flex flex-col space-y-6 transition-all duration-800 ease-out ${
								isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
							}`}
							style={{
								transitionDelay: isOpen ? '300ms' : '0ms',
								transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
							}}
						>
							{/* Navigation links with enhanced animations */}
							<div className="flex flex-col space-y-1">
								<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Navigation</h3>
								{props.navbarItems.links.map((link, index) => {
									const isAnchorLink = link.href.startsWith('/#');
									const sectionId = isAnchorLink ? link.href.substring(2) : '';

									return (
										<Link
											key={index}
											href={link.href}
											onClick={isAnchorLink ? (e) => handleAnchorClick(e, link.href, sectionId) : handleNavigationClick}
											className={`group relative text-gray-700 hover:text-black font-medium text-lg py-4 px-4 rounded-xl transition-all duration-500 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${
												pathname === link.href || (isAnchorLink && pathname === "/Home") ? "text-black font-semibold bg-gradient-to-r from-gray-100 to-gray-50 shadow-md border border-gray-200" : ""
											} ${isOpen ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-8'}`}
											style={{
												animationDelay: `${400 + (index * 150)}ms`,
												transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
											}}
										>
											<span className="relative z-10">{link.label}</span>
											<div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</Link>
									);
								})}
							</div>

							<Separator className="my-6" />

							{/* Enhanced Auth buttons */}
							<div
								className={`flex flex-col space-y-4 transition-all duration-700 ease-out ${
									isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
								}`}
								style={{
									transitionDelay: isOpen ? '600ms' : '0ms',
									transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
								}}
							>
								<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Get Started</h3>
								<Link href="/login" onClick={handleNavigationClick}>
									<Button
										variant="outline"
										className="w-full justify-center text-gray-700 hover:text-black font-medium border-gray-300 py-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:border-gray-400 active:scale-[0.98] hover:bg-gradient-to-r hover:from-gray-50 hover:to-white"
									>
										Log In
									</Button>
								</Link>
								<Link href="/signup" onClick={handleNavigationClick}>
									<Button
										className="w-full bg-black hover:bg-gray-800 text-white font-medium py-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] hover:-translate-y-1 hover:bg-gradient-to-r hover:from-gray-900 hover:to-black"
									>
										Sign Up
									</Button>
								</Link>
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</nav>
	);
}
