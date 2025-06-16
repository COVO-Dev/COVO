"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useLogin() {
	const [error, setError] = useState("");
	const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
	const [loginData, setLoginData] = useState({
		email: "",
		password: "",
	});
	const router = useRouter();

	const handleLogin = async () => {
		const response = await signIn("credentials", {
			redirect: false,
			email: loginData.email,
			password: loginData.password,
		});
		if (response?.error) {
			setError(response.error as string);
		} else if (response?.ok) {
			router.refresh();
			setLoggedInSuccessfully(`log in successful`);
		}
	};

	return { error, loggedInSuccessfully, loginData, setLoginData, handleLogin };
}
