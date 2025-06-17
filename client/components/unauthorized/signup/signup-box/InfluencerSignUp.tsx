"use client";

import { influencerRegisterRoute } from "@/lib/api/register/influencer/influencerRegister.route";
import { signIn } from "next-auth/react";
import { useState } from "react";
import TermsCheckBoxes from "../terms-check-boxs/TermsCheckBoxes.component";
import { useRouter } from "next/navigation";

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
		// Clear previous errors
		setError("");
		
		// Validate required fields
		if (!influencerData.firstName || !influencerData.lastName || 
			!influencerData.email || !influencerData.password || 
			!influencerData.username) {
			setError("Please fill in all required fields");
			return;
		}

		if (!consentAndAgreements.termsAccepted) {
			setError("Please accept the terms and conditions");
			return;
		}

		if (!consentAndAgreements.dataComplianceConsent) {
			setError("Please accept the data compliance consent");
			return;
		}

		try {
			const response = await influencerRegisterRoute({
				...influencerData,
				consentAndAgreements,
			});

			console.log("Full response:", response);
			
			if (response.status === "error") {
				setError(response.message as string);
				console.error("Registration error:", response.message);
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
			}
		} catch (error) {
			console.error("Network or unexpected error:", error);
			setError("Registration failed. Please try again.");
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

			{error && (
				<div className="mb-4 p-3 rounded-md bg-red-100 border border-red-400 text-red-700">
					{error}
				</div>
			)}

			{loggedInSuccessfully && (
				<div className="mb-4 p-3 rounded-md bg-green-100 border border-green-400 text-green-700">
					{loggedInSuccessfully}
				</div>
			)}

			<button
				onClick={handleSignUp}
				className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none"
			>
				Sign Up
			</button>
		</div>
	);
}
