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

			<div className="w-full h-auto flex flex-col justify-center items-center text-center max-w-[800px] px-4 mt-[90px] gap-4">
				<h2 className="text-3xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
				<p className="text-2xltext-gray-600">{user.industry}</p>
				<div className="bg-sidebar-border flex p-5 gap-8 rounded-md">
					<p>
						<span className="font-semibold mr-1">email:</span>
						<span>{user.email}</span>
					</p>
				</div>
				{user.bio && <p className="text-gray-600 font-bold">About Me</p>}
				<p className="text-gray-600">{user.bio}</p>
			</div>
		</div>
	);
}
