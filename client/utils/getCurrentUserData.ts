"use server";
import { IInitialState } from "@/lib/store/profile/profile.model";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export default async function getCurrentUserData() {
	// Extract the session token from cookies
	const cookieStore = await cookies();
	const req = {
		cookies: cookieStore,
	} as unknown as NextRequest;

	// Pass the mock req to getToken
	const tokenData = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});

	console.log("====================================");

	console.log("tokenData: ", tokenData);
	console.log("====================================");

	// Generate a new JWT token with the extracted token data
	if (!tokenData) {
		return null;
	}
	return tokenData.user as IInitialState;
}
