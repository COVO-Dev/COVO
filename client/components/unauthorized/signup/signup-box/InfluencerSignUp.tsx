"use client";

import { influencerRegisterRoute } from "@/lib/api/register/influencer/influencerRegister.route";
import { signIn } from "next-auth/react";
import { useState } from "react";
import TermsCheckBoxes from "../terms-check-boxs/TermsCheckBoxes.component";
import { useRouter } from "next/navigation";
import { InfoIcon } from "lucide-react";

export default function InfluencerSignUp() {
	const [error, setError] = useState("");
	const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
	const [consentAndAgreements, setConsentAndAgreements] = useState({
		termsAccepted: false,
		marketingOptIn: false,
		dataComplianceConsent: false,
	});
	const [privacyPolicy, setPrivacyPolicy] = useState(false);
	const [influencerData, setInfluencerData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		username: "",
		yearOfBirth: "",
		// phoneNumber: "",
		userType: "",
	});

	const router = useRouter();

	const handleConsent = (field: string, value: boolean) => {
		setConsentAndAgreements(prev => {
			const updated = { ...prev, [field]: value };
			if (field === 'termsAccepted') {
				setPrivacyPolicy(value);
			}
			return updated;
		});
	};

	const handleSignUp = async () => {
	
		setError("");
		
		
		if (!influencerData.firstName || !influencerData.lastName || 
			!influencerData.email || !influencerData.password || 
			!influencerData.username || !influencerData.yearOfBirth) {
			setError("Please fill in all required fields");
			return;
		}

		
		const currentYear = new Date().getFullYear();
		const birthYear = parseInt(influencerData.yearOfBirth);
		if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear - 13) {
			setError("Please enter a valid year of birth. You must be at least 13 years old.");
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

		if (!privacyPolicy) {
			setError("Please accept the privacy policy");
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
			console.error("Registration error:", error);
			setError("An error occurred during registration. Please try again.");
		}
	};

	return (
		<div className="w-auto flex-col">
			{/* Follower Requirement Disclaimer */}
			<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
				<InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
				<div>
					<h4 className="font-medium text-blue-800 mb-1">Minimum Follower Requirement</h4>
					<p className="text-sm text-blue-700">
						COVO requires all influencers to have at least 1,000 followers on their primary platform. 
						We prioritize genuine engagement and consistent brand identity over follower count beyond this threshold.
					</p>
				</div>
			</div>

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
			<div className="mb-4">
				<label htmlFor="yearOfBirth" className="sr-only">
					Year of Birth
				</label>
				<select
					id="yearOfBirth"
					name="yearOfBirth"
					value={influencerData.yearOfBirth}
					onChange={(e) =>
						setInfluencerData((prev) => ({
							...prev,
							yearOfBirth: e.target.value,
						}))
					}
					className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
					aria-label="Select your year of birth"
					aria-required="true"
				>
					<option value="" disabled className="text-gray-500">
						Select Year of Birth
					</option>
					{(() => {
						const currentYear = new Date().getFullYear();
						const maxYear = currentYear - 13; // Ensure user is at least 13 years old
						const years = [];

						// Generate years from most recent (maxYear) to oldest (1900)
						for (let year = maxYear; year >= 1900; year--) {
							years.push(
								<option key={year} value={year.toString()} className="text-gray-700">
									{year}
								</option>
							);
						}
						return years;
					})()}
				</select>
			</div>

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
				privacyPolicy={privacyPolicy}
				privacyPolicyChange={(checked) => {
					setPrivacyPolicy(checked);
					if (checked) {
						setError(""); // Clear error when privacy policy is accepted
					}
				}}
				onErrorClear={() => setError("")}
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
