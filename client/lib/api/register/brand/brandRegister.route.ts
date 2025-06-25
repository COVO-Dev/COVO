"use server";

import endpoints from "../../endpoints";
import {
	brandRegisterSchema,
	IbrandRegister,
} from "./brandRegister.validation";

export async function brandRegisterRoute(brandRegisterData: IbrandRegister) {
	console.log(endpoints.brandRegister);
	console.log("brandRegisterData", brandRegisterData);
	const response = await fetch(endpoints.brandRegister, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(brandRegisterSchema.parse(brandRegisterData)),
	});

	const responseData = await response.json();
	console.log(responseData);

	if (!response.ok) {
		return {
			status: "error",
			message: responseData.message || response.statusText,
		};
	}

	return { status: "success", data: responseData };
}
