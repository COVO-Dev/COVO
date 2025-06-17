"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { brandUpdateDataRoute } from "@/lib/api/update-data/brand/brandUpdateData.route";
import { brandFormDataSchema } from "@/lib/api/update-data/brand/brandUpdateData.validation";
import { useRouter } from "next/navigation";
import undraw_fill_formsNpwp from "@/assets/svg/undraw_fill-formsNpwp.svg";

type Inputs = z.infer<typeof brandFormDataSchema>;

const steps = [
	{
		id: "Step 1",
		name: "Company Details",
		fields: ["companyDetails"],
	},
	{
		id: "Step 2",
		name: "Social & Payment",
		fields: ["socialMediaProfiles", "paymentInformation"],
	},
	{
		id: "Step 3",
		name: "Complete",
		fields: ["companyBio", "consentAndAgreements"],
	},
];

export default function BrandRegistration() {
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [previousStep, setPreviousStep] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);
	const delta = currentStep - previousStep;
	const { data: session } = useSession();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		trigger,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(brandFormDataSchema),
		defaultValues: {},
	});

	// Navigation functions
	const next = async () => {
		const fields = steps[currentStep].fields;
		const output = await trigger(fields as Array<keyof Inputs>, {
			shouldFocus: true,
		});

		if (!output) return;

		if (currentStep < steps.length - 1) {
			setPreviousStep(currentStep);
			setCurrentStep((step) => step + 1);
		}
	};

	const prev = () => {
		if (currentStep > 0) {
			setPreviousStep(currentStep);
			setCurrentStep((step) => step - 1);
		}
	};

	const handleAddMoreInfo = async (formData) => {
		try {
			const token = session?.user?.access_token;
			const userId = session?.user?._id;

			if (!token) {
				throw new Error("Failed to retrieve access token from session.");
			}

			if (!userId) {
				throw new Error("Failed to retrieve user ID from session.");
			}

			const result = await brandUpdateDataRoute(formData, token, userId);

			if (result.status === "error") {
				setError(result.message);
			} else {
				setSuccessMessage("Profile updated successfully!");
				console.log("Success:", result.data);
				router.push("/brand/dashboard");
			}
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message || "An unexpected error occurred.");
				console.error("Error updating brand data:", err);
			} else {
				setError("An unexpected error occurred.");
				console.error("Error updating brand data:", err);
			}
		}
	};
	console.log("session?.user", session?.user);
	return (
		<div className='bg-[url("/svg/BG.svg")] flex-col flex md:p-[100px] p-[20px] justify-center items-center w-full h-full'>
			<div className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] rounded-md shadow-lg p-[30px] flex-col flex justify-center items-center w-full h-full'>
				<div className="flex justify-center items-center w-full">
					<Image
						src={undraw_fill_formsNpwp}
						alt="Registration form illustration"
						width={200}
						height={200}
						className="w-[300px] h-auto bg-black/20 p-[20px] rounded-md"
					/>
				</div>
				<br />
				{/* Form Steps Navigation */}
				<div className="max-w-[1060px] w-full h-auto">
					<nav aria-label="Progress" className="w-full">
						<ol role="list" className="flex space-x-0.5 space-y-0 w-auto">
							{steps.map((step, index) => (
								<li key={step.name} className="flex-1">
									{currentStep > index ? (
										<div className="group flex w-full flex-col border-sky-600 py-2 transition-colors border-l-0 border-t-4 pb-0 pl-0 pt-4">
											<span className="text-sm font-medium text-sky-600 transition-colors">
												{step.id}
											</span>
											<span className="text-sm font-medium">{step.name}</span>
										</div>
									) : currentStep === index ? (
										<div
											className="flex w-full flex-col text-center border-sky-600 py-2 border-l-0 border-t-4 pb-0 pl-0 pt-4"
											aria-current="step"
										>
											<span className="text-sm font-medium text-sky-600">
												{step.id}
											</span>
											<span className="text-sm font-medium">{step.name}</span>
										</div>
									) : (
										<div className="group flex w-full flex-col text-center border-gray-200 py-2 transition-colors border-l-0 border-t-4 pb-0 pl-0 pt-4">
											<span className="text-sm font-medium text-gray-500 transition-colors">
												{step.id}
											</span>
											<span className="text-sm font-medium">{step.name}</span>
										</div>
									)}
								</li>
							))}
						</ol>
					</nav>

					<form onSubmit={handleSubmit(handleAddMoreInfo)} className="mt-8">
						{/* Step 1: Company Details */}
						{currentStep === 0 && (
							<motion.div
								initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<div className="space-y-4">
									<input
										{...register("companyName")}
										placeholder="Company Name"
										className={`${
											errors.companyName
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
									/>
									<input
										{...register("companyWebsite")}
										placeholder="Company Website"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
									<input
										{...register("position")}
										placeholder="Your Position"
										className={`${
											errors.companyWebsite
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
									/>
									<input
										{...register("industry")}
										placeholder="Industry"
										className={`${
											errors.industry
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
									/>
									<input
										{...register("businessType")}
										placeholder="Business Type"
										className={`${
											errors.businessType
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
									/>
									<input
										{...register("logo")}
										placeholder="Logo URL"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
								</div>
							</motion.div>
						)}

						{/* Step 2: Social & Payment */}
						{currentStep === 1 && (
							<motion.div
								initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<div className="space-y-4">
									<input
										{...register("socialMedia.instagram")}
										placeholder="Instagram Profile"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
									<input
										{...register("socialMedia.facebook")}
										placeholder="Facebook Page"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
									<input
										{...register("socialMedia.linkedin")}
										placeholder="LinkedIn Profile"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
									<input
										{...register("socialMedia.twitter")}
										placeholder="Twitter Handle"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
									/>
									<input
										{...register("paymentDetails.method")}
										placeholder="Payment Method"
										className={`${
											errors.paymentDetails?.method
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
									/>
									<textarea
										{...register("paymentDetails.billingInfo")}
										placeholder="Billing Information"
										className={`${
											errors.paymentDetails?.billingInfo
												? "border-red-500 animate-shake"
												: "border-custom-dark-desaturated-blue"
										} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
										rows={4}
									/>
								</div>
							</motion.div>
						)}

						{/* Step 3: Complete */}
						{currentStep === 2 && (
							<motion.div
								initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<div className="space-y-4">
									<textarea
										{...register("bio")}
										placeholder="bio"
										className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
										rows={4}
									/>

									{/* <div className="space-y-2">
										<div className="flex items-center">
											<input
												type="checkbox"
												{...register("consentAndAgreements.termsAccepted")}
												className="mr-2"
											/>
											<label>I accept the terms and conditions</label>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												{...register("consentAndAgreements.marketingOptIn")}
												className="mr-2"
											/>
											<label>I agree to receive marketing communications</label>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												{...register(
													"consentAndAgreements.dataComplianceConsent"
												)}
												className="mr-2"
											/>
											<label>I consent to data processing</label>
										</div>
									</div> */}

									<button
										type="submit"
										className="w-full mt-6 mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none"
									>
										Complete Registration
									</button>

									<div className="w-full h-7 text-red-500 text-sm text-center font-bold">
										{error}
									</div>
									{successMessage && (
										<div className="success text-green-600 text-center">
											{successMessage}
										</div>
									)}
								</div>
							</motion.div>
						)}
					</form>

					{/* Navigation Buttons */}
					<div className="mt-5">
						<div className="flex justify-between">
							<button
								type="button"
								onClick={prev}
								disabled={currentStep === 0}
								className="flex justify-center items-center rounded pr-2 bg-white w-[110px] h-[40px] text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="h-6 w-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15.75 19.5L8.25 12l7.5-7.5"
									/>
								</svg>
								Previous
							</button>
							<button
								type="button"
								onClick={next}
								disabled={currentStep === steps.length - 1}
								className="flex justify-center items-center rounded bg-white w-[110px] h-[40px] pl-2 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="h-6 w-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
