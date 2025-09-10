import { LucideIcon } from "lucide-react"
import { ReactNode } from "react";

export interface NavbarItems {
	links: Array<{
		label?: string;
		href: string;
		icon?: LucideIcon | ReactNode;
	}>;
	extras?: ReactNode;
}