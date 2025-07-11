// Layout in the root of @/app contains only information about fonts and meta-data

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Roboto } from "next/font/google";
import { RootProvider } from "@/provider/RootProvider.component";
const roboto = Roboto({
	weight: ["100", "300", "400", "500", "700", "900"],
	subsets: ["latin"],
});

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "COVO | Where influencers and brands get work done",
	description: "Where influencers and brands get work done",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>COVO | Where influencers and brands get work done</title>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased ${roboto.className}`}
				suppressHydrationWarning={true}
			>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
