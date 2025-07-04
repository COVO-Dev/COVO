"use client";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetFields, setProfileData } from "@/lib/store/profile/profile.slice";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ProfileProvider() {
	const session = useSession();
	const dispatch = useAppDispatch();
	useEffect(() => {
		console.log("ProfileProvider - session status:", session.status);
		console.log("ProfileProvider - session data:", session.data);
		console.log("ProfileProvider - user data:", session.data?.user);
		
		if (session && session.data?.user) {
			console.log("ProfileProvider - setting profile data:", session.data.user);
			dispatch(setProfileData(session.data.user));
		} else {
			console.log("ProfileProvider - resetting fields");
			dispatch(resetFields());
		}
	}, [session, dispatch]);
	return null;
}
