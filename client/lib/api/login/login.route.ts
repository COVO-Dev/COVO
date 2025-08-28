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
		return { status: "error", message: response.statusText };
	}

	return { status: "success", data: await response.json() };
}
