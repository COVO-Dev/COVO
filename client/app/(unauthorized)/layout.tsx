import Footer from "@/components/unauthorized/footer/Footer.page";
import { Navbar } from "@/components/unauthorized/navbar/navbar";
import getCurrentUserData from "@/utils/getCurrentUserData";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const userData = await getCurrentUserData();
	if (userData) {
		redirect("/brand/dashboard");
	}
	console.log("userData: ", userData);
	return (
		<section>
			<Navbar />
			{children}
			<Toaster />
			<Footer />
		</section>
	);
}
