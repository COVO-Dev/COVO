"use client";

import { influencerRegisterRoute } from "@/lib/api/register/influencer/influencerRegister.route";
import { signIn } from "next-auth/react";
import { useState } from "react";
import TermsCheckBoxes from "../terms-check-boxs/TermsCheckBoxes.component";
import { useRouter } from "next/navigation";
import ILogin from "@/lib/api/login/login.validation";

export default function InfluencerSignUp() {
	const [error, setError] = useState("");
	const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
	const [consentAndAgreements, setConsentAndAgreements] = useState({
		termsAccepted: false,
		marketingOptIn: false,
		dataComplianceConsent: false,
	});
	const [influencerData, setInfluencerData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		username: "",
		// phoneNumber: "",
		userType: "",
	});

	const router = useRouter();

	const handleSignUp = async () => {
		const response = await influencerRegisterRoute({
			...influencerData,
			consentAndAgreements,
		});

		console.log(response, "Influencer SignUpBox");
		if (response.status === "error") {
			setError(response.message as string);
			console.error(response.message, "Influencer SignUpBox");
		} else if (response.status === "success") {
			const signInResponse = await signIn("credentials", {
				redirect: false,
				email: influencerData.email,
				password: influencerData.password,
			});

			if (signInResponse?.error) {
				setError(signInResponse.error);
			} else if (signInResponse?.ok) {
				setLoggedInSuccessfully("User registered successfully");

				router.push("/influencer/additional");
			}
			console.log(loggedInSuccessfully);
		}
	};

	return (
		<div className="w-auto flex-col">
			<div className="w-auto flex justify-between">
				<input
					type="text"
					name="firstName"
					value={influencerData.firstName}
					onChange={(e) =>
						setInfluencerData((prev) => ({
							...prev,
							firstName: e.target.value,
						}))
					}
					placeholder="First Name"
					className="mr-1 mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
				/>
				<input
					type="text"
					name="lastName"
					value={influencerData.lastName}
					onChange={(e) =>
						setInfluencerData((prev) => ({
							...prev,
							lastName: e.target.value,
						}))
					}
					placeholder="Last Name"
					className="ml-1 mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
				/>
			</div>

			<input
				type="email"
				name="email"
				value={influencerData.email}
				onChange={(e) =>
					setInfluencerData((prev) => ({ ...prev, email: e.target.value }))
				}
				placeholder="Email"
				className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
			/>
			<input
				type="password"
				name="password"
				value={influencerData.password}
				onChange={(e) =>
					setInfluencerData((prev) => ({
						...prev,
						password: e.target.value,
					}))
				}
				placeholder="Password"
				className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
			/>
			<input
				type="text"
				name="username"
				value={influencerData.username}
				onChange={(e) =>
					setInfluencerData((prev) => ({
						...prev,
						username: e.target.value,
					}))
				}
				placeholder="Username"
				className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
			/>

			{/* <input
        type="text"
        name="phone"
        value={influencerData.phoneNumber}
        onChange={(e) =>
          setInfluencerData((prev) => ({ ...prev, phoneNumber: e.target.value }))
        }
        placeholder="Phone Number"
        className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      /> */}

			<TermsCheckBoxes
				consentAndAgreements={consentAndAgreements}
				setConsentAndAgreements={setConsentAndAgreements}
			/>

			<button
				onClick={handleSignUp}
				className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none"
			>
				Sign Up
			</button>
		</div>
	);
}
