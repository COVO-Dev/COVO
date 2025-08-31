"use client";
import AshrafAtef from "@/assets/images/Ashraf-Atef.jpeg";
import cover01 from "@/assets/images/cover-01.png";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/lib/store/hooks";
import UpdateProfile from "@/app/(authorized)/brand/profile/updateProfile";
import UpdateProfilePicture from "@/app/(authorized)/influencer/profile/updateProfilePicture";
import { Loader2 } from "lucide-react";

export default function UserAvatar({ token, id, isLoading, user }) {
	// Helper function to format company size display
	const formatCompanySize = (size: string) => {
		if (!size) return null;
		// If the size already contains "employees", return as is
		if (size.includes('employees')) return size;
		// Otherwise, add "employees" suffix
		return `${size} employees`;
	};

	return (
		<div className="flex flex-wrap justify-center items-center border-b-[1px] border-sidebar-border pb-2">
			<div className="w-full h-[250px] flex justify-center items-center relative">
				<div className="h-[90%] w-[95%] p-5  absolute">
					<Image
						src={cover01}
						alt="Cover Picture"
						layout="fill"
						objectFit="cover"
						className=" w-full h-full rounded-lg"
					/>
					<div className="flex justify-between items-center  gap-4">
						<p className="text-lg w-[160px] text-center border-2 rounded-md text-white p-2 font-weight-[800] z-10 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm">
							Covo Score: 8.20
						</p>
						<UpdateProfile />
					</div>
				</div>
				<div className="relative w-[10rem] h-[10rem] max-h-[10rem] mt-[200px]">
					{user.logo ? (
						<>
							{!isLoading ?
								<Image
									src={user.logo}
									alt="Profile Picture"
									layout="fill"
									className="rounded-full border-8 border-gray-300"
									style={{ objectFit: "cover", objectPosition: "center" }}
								/> :
								<div
									className="rounded-full z-10  w-[10rem] h-[10rem] flex items-center
                justify-center font-bold text-xl bg-slate-200 border-8
                border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
								>
									<Loader2 className="animate-spin w-20 h-20" />
								</div>
							}
						</>
						// <Image
						// 	src={user.logo}
						// 	alt="Profile Picture"
						// 	layout="fill"
						// 	className="rounded-full border-8 border-gray-300"
						// 	style={{ objectFit: "cover", objectPosition: "center" }}
						// />
					) : (
						<div
							className="rounded-full z-10  w-[10rem] h-[10rem] flex items-center
                justify-center font-bold text-xl bg-slate-200 border-8
                border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
						>
							{user.firstName.slice(0, 2).toLocaleUpperCase()}
						</div>
					)}
					<UpdateProfilePicture token={token} id={id} userRole={user.role} />
				</div>
				{/* <div
					// src={AshrafAtef}
					// alt="Profile Picture"
					// height={200}
					className="rounded-full z-10 mt-[200px] w-[10rem] h-[10rem] flex items-center justify-center font-bold text-xl bg-slate-200 border-8 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
				>
					{user.firstName.slice(0, 2).toLocaleUpperCase()}
				</div> */}
			</div>

			<div className="w-full h-auto flex flex-col justify-center items-center text-center max-w-[800px] px-4 mt-[90px] gap-6">
				<h2 className="text-3xl font-bold text-gray-900">{`${user.firstName} ${user.lastName}`}</h2>
				<p className="text-xl text-gray-600 font-medium">{user.industry}</p>

				{/* Company Metrics Card */}
				<div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg w-full max-w-lg">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center justify-center gap-2">
							<span className="font-semibold text-gray-700">Email:</span>
							<span className="text-gray-600">{user.email}</span>
						</div>
						{user.companySize && (
							<div className="flex items-center justify-center gap-2">
								<span className="font-semibold text-gray-700">Company Size:</span>
								<span className="text-gray-600">{formatCompanySize(user.companySize)}</span>
							</div>
						)}
					</div>
				</div>

				{/* Bio Section */}
				{user.bio ? (
					<div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg w-full">
						<h3 className="text-lg font-bold text-gray-900 mb-4">About Our Brand</h3>
						<p className="text-gray-700 leading-relaxed text-left whitespace-pre-wrap">
							{user.bio}
						</p>
					</div>
				) : (
					<div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm w-full">
						<h3 className="text-lg font-medium text-gray-500 mb-2">About Our Brand</h3>
						<p className="text-gray-400 italic">
							No brand description available. Update your profile to add a compelling brand story.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
