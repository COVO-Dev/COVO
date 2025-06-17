"use client";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetFields, setProfileData } from "@/lib/store/profile/profile.slice";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ProfileProvider() {
	const session = useSession();
	const dispatch = useAppDispatch();
	useEffect(() => {
		if (session && session.data?.user)
			dispatch(setProfileData(session.data.user));
		else dispatch(resetFields());
	}, [session]);
	return null;
}
