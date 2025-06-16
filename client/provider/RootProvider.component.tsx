"use client";
import { SessionProvider } from "next-auth/react";
import StoreProvider from "./StoreProvider";
import ProfileProvider from "./ProfileProvider";

export function RootProvider({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<StoreProvider>
				<ProfileProvider />
				{children}
			</StoreProvider>
		</SessionProvider>
	);
}
