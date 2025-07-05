"use client";

import Link from "next/link";
import { useState } from "react";
import InfluencerSignUp from "./InfluencerSignUp";
import BrandSignUp from "./BrandSignUp";

export default function SignUpBox() {
	const [activeTab, setActiveTab] = useState("brand");

	return (
		<div className="rounded-lg w-auto max-w-lg z-40 relative flex-col items-center justify-center h-auto">
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
					Join COVO
				</h1>
				<p className="text-gray-600 text-lg">
					Create your account and start collaborating
				</p>
			</div>

			{/* Tab Navigation */}
			<div className="flex justify-center mb-8 bg-gray-50 rounded-xl p-1 w-full">
				<button
					onClick={() => setActiveTab("influencer")}
					className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 w-[50%] ${
						activeTab === "influencer"
							? "bg-white text-black shadow-md"
							: "text-gray-600 hover:text-black hover:bg-white/50"
					}`}
				>
					Influencer
				</button>
				<button
					onClick={() => setActiveTab("brand")}
					className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 w-[50%] ${
						activeTab === "brand"
							? "bg-white text-black shadow-md"
							: "text-gray-600 hover:text-black hover:bg-white/50"
					}`}
				>
					Brand
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === "influencer" && (
				<InfluencerSignUp />
			)}
			{activeTab === "brand" && (
				<BrandSignUp />
			)}

			{/* Login Link */}
			<div className="text-center mt-6">
				<p className="text-gray-600 text-sm">
					Already have an account?{" "}
					<Link
						className="text-black font-semibold hover:text-gray-700 transition-colors duration-200 hover:underline"
						href={"/login"}
					>
						Sign In
					</Link>
				</p>
			</div>
		</div>
	);
}
