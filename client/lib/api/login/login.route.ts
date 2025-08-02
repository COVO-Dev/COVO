"use server";

import endpoints from "../endpoints";
import { loginSchema, ILogin } from "./login.validation";

export async function loginRoute(loginData: ILogin) {
	console.log(loginData);
	const response = await fetch(endpoints.login, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(loginSchema.parse(loginData)),
	});

	if (!response.ok) {
		try {
			const errorData = await response.json();
			// Map backend errors to user-friendly messages for security
			if (errorData.message === "User not found" || errorData.message === "Invalid password") {
				return { status: "error", message: "Incorrect Username or Password" };
			}
			return { status: "error", message: errorData.message || response.statusText };
		} catch {
			return { status: "error", message: response.statusText };
		}
	}

	return { status: "success", data: await response.json() };
}
