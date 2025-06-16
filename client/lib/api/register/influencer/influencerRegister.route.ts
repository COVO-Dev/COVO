"use server";

import endpoints from "../../endpoints";
import {
	influencerRegisterSchema,
	IinfluencerRegister,
} from "./influencerRegister.validation";

export async function influencerRegisterRoute(influencerRegisterData: IinfluencerRegister) {
	console.log(endpoints.influencerRegister, "Fetch ServerURL");
	const response = await fetch(endpoints.influencerRegister, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(
			influencerRegisterSchema.parse(influencerRegisterData)
		),
	});

	if (!response.ok) {
		return { status: "error", message: response.statusText };
	}

	return { status: "success", data: await response.json() };
}
