"use client";
import { SessionProvider } from "next-auth/react";
import StoreProvider from "./StoreProvider";
import ProfileProvider from "./ProfileProvider";
import { GrammarlySuppressionScript } from "@/components/shared/GrammarlySuppressionScript";

export function RootProvider({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<StoreProvider>
				<ProfileProvider />
				<GrammarlySuppressionScript />
				{children}
			</StoreProvider>
		</SessionProvider>
	);
}
