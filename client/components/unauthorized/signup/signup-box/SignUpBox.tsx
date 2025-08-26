"use client";

import Link from "next/link";
import { useState } from "react";
import InfluencerSignUp from "./InfluencerSignUp";
import BrandSignUp from "./BrandSignUp";

export default function SignUpBox() {
	const [activeTab, setActiveTab] = useState("brand");

	return (
		<div className=" rounded-lg  w-auto max-w-[400px] z-40 relative flex-col items-center justify-center h-auto ">

			<div className="flex justify-center mb-4  bg-transparent text-black ">
				<button
					onClick={() => setActiveTab("influencer")}
					className={`px-4 py-2 w-[50%] ${activeTab === "influencer" ? "border-b-4 border-blue-950 " : "hover:border-2 hover:border-slate-300  duration-300 "}  `}
				>
					Influencer
				</button>
				<button
					onClick={() => setActiveTab("brand")}
					className={`px-4 py-2 w-[50%] ${activeTab === "brand" ? "border-b-4 border-blue-950 " : "hover:border-2 hover:border-slate-300  duration-300 "}  `}
				>
					Brand
				</button>
			</div>


			{activeTab === "influencer" && (
				<InfluencerSignUp />
			)}
			{activeTab === "brand" && (
				<BrandSignUp />
			)}


			<h1 className="text-custom-dark-desaturated-blue text-center text-sm pt-2">
				Already have an account?{" "}
				<Link className="text-custom-lark-blue" href={"/login"}>Login</Link>
			</h1>
		</div>
	);
}
