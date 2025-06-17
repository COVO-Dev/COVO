"use client";

import { brandRegisterRoute } from "@/lib/api/register/brand/brandRegister.route";
import { signIn } from "next-auth/react";
import { useState } from "react";
import TermsCheckBoxes from "../terms-check-boxs/TermsCheckBoxes.component";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

// Define the form schema
const FormDataSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	// phoneNumber: z.string().min(1, "Phone number should be no longer than 18 numbers"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	companyName: z.string().min(1, "Company name is required"),
	position: z.string().min(1, "Position is required"),
	username: z.string().min(1, "Username is required"),
	consentAndAgreements: z.object({
		termsAccepted: z.boolean(),
		marketingOptIn: z.boolean(),
		dataComplianceConsent: z.boolean(),
	}),
});

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
	{
		id: "Step 1",
		name: "Personal Information",
		fields: ["firstName", "lastName", "email", "password"],
	},
	{
		id: "Step 2",
		name: "Company Information",
		fields: ["phoneNumber", "companyName", "position"],
	},
	{
		id: "Step 3",
		name: "Complete",
		fields: [],
	},
];

export default function BrandSignUp() {
	const [error, setError] = useState("");
	const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
	const [consentAndAgreements, setConsentAndAgreements] = useState({
		termsAccepted: false,
		marketingOptIn: false,
		dataComplianceConsent: false,
	});
	const [previousStep, setPreviousStep] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);
	const delta = currentStep - previousStep;
	const router = useRouter();

	const {
		register,
		handleSubmit,
		trigger,
		formState: { errors },
		getValues,
	} = useForm<Inputs>({
		resolver: zodResolver(FormDataSchema),
	});

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

	const handleSignUp = async () => {
		try {
			const formData = getValues();
			console.log("Submitting form data:", formData);
			const response = await brandRegisterRoute({
				firstName: formData.firstName,
				lastName: formData.lastName,
				companyName: formData.companyName,
				email: formData.email,
				position: formData.position,
				// phoneNumber: formData.phoneNumber,
				password: formData.password,
				consentAndAgreements,
				username: formData.username,
			});

			console.log("API response:", response);
			if (response.status === "error") {
				console.error("Error during sign-up:", response.message);
				setError(response.message as string);
			} else if (response.status === "success") {
				const signInResponse = await signIn("credentials", {
					redirect: false,
					email: formData.email,
					password: formData.password,
				});
				console.log("Sign-in response:", signInResponse);

				if (signInResponse?.error) {
					setError(signInResponse.error);
				} else if (signInResponse?.ok) {
					setLoggedInSuccessfully("Brand registered successfully");
					router.push("/brand/moreInfo");
				}
			}
		} catch (error) {
			console.error("Error during sign-up:", error);
			setError("An unexpected error occurred.");
		}
	};

	return (
		<div className="md:w-[400px]  w-auto flex-col">
			<br />
			<div className="w-full h-[50px] flex justify-between items-center ">
				<nav aria-label="Progress" className=" w-full  ">
					<ol role="list" className=" flex space-x-0.5  space-y-0 w-auto">
						{steps.map((step, index) => (
							<li key={step.name} className="flex-1 ">
								{currentStep > index ? (
									<div className="group flex w-full flex-col  border-sky-600 py-2 transition-colors border-l-0 border-t-4 pb-0 pl-0 pt-4">
										<span className="text-sm font-medium text-sky-600 transition-colors ">
											{step.id}
										</span>
										<span className="text-sm font-medium">{step.name}</span>
									</div>
								) : currentStep === index ? (
									<div
										className="flex w-full flex-col text-center border-sky-600 py-2 border-l-0 border-t-4 pb-0 pl-0 pt-4"
										aria-current="step"
									>
										<span className="text-sm font-medium text-sky-600 ">
											{step.id}
										</span>
										<span className="text-sm font-medium ">{step.name}</span>
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
			</div>
			<br />
			<br />

			<form onSubmit={handleSubmit(handleSignUp)}>
				{currentStep === 0 && (
					<motion.div
						initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<div className="w-auto flex justify-between">
							{/* first name input */}
							<div className="w-full mr-1">
								<input
									{...register("firstName")}
									placeholder="First Name"
									className={`${
										errors.firstName
											? "border-red-500 animate-shake"
											: "border-custom-dark-desaturated-blue"
									} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
								/>
								<div className="w-full h-5 text-red-500 text-xs">
									{errors.firstName && <span>{errors.firstName.message}</span>}
								</div>
							</div>

							{/* last name input */}
							<div className="w-full ml-1">
								<input
									{...register("lastName")}
									placeholder="Last Name"
									className={`${
										errors.lastName
											? "border-red-500 animate-shake"
											: "border-custom-dark-desaturated-blue"
									} w-full p-3  rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
								/>
								<div className="w-full h-5 text-red-500 text-xs">
									{errors.lastName && <div>{errors.lastName.message}</div>}
								</div>
							</div>
						</div>

						{/* email input */}
						<div className="w-full">
							<input
								{...register("username")}
								placeholder="User Name"
								className={`${
									errors.username
										? "border-red-500 animate-shake"
										: "border-custom-dark-desaturated-blue"
								} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
							/>
							<div className="w-full h-5 text-red-500 text-xs">
								{errors.username && <span>{errors.username.message}</span>}
							</div>
						</div>

						{/* email input */}
						<div className="w-full">
							<input
								{...register("email")}
								placeholder="Email"
								className={`${
									errors.email
										? "border-red-500 animate-shake"
										: "border-custom-dark-desaturated-blue"
								} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
							/>
							<div className="w-full h-5 text-red-500 text-xs">
								{errors.email && <span>{errors.email.message}</span>}
							</div>
						</div>

						{/* password input */}
						<div>
							<input
								{...register("password")}
								type="password"
								placeholder="Password"
								className={`${
									errors.password
										? "border-red-500 animate-shake"
										: "border-custom-dark-desaturated-blue"
								} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none `}
							/>
							<div className="w-full h-5 text-red-500 text-xs">
								{errors.password && <span>{errors.password.message}</span>}
							</div>
						</div>
					</motion.div>
				)}

				{currentStep === 1 && (
					<motion.div
						initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<div>
							<input
								{...register("companyName")}
								placeholder="Company Name"
								className={`${
									errors.companyName
										? "border-red-500 animate-shake"
										: "border-custom-dark-desaturated-blue"
								} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
							/>
							<div className="w-full h-5 text-red-500 text-xs">
								{errors.companyName && (
									<span>{errors.companyName.message}</span>
								)}
							</div>
						</div>

						<div>
							<input
								{...register("position")}
								placeholder="Position"
								className={`${
									errors.position
										? "border-red-500 animate-shake"
										: "border-custom-dark-desaturated-blue"
								} w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
							/>
							<div className="w-full h-5 text-red-500 text-xs">
								{errors.position && (
									<span className="text-red-500 text-xs ">
										{errors.position.message}
									</span>
								)}
							</div>
						</div>

						{/* <div>
              <input
                {...register("phoneNumber")}
                placeholder="Phone Number"
                className={`${errors.phoneNumber ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'}  w-full p-3 rounded-md border  bg-white/50 placeholder-gray-500 focus:outline-none`}
              />
              <div className="w-full h-5 text-red-500 text-xs">
                {errors.phoneNumber && (
                  <span>{errors.phoneNumber.message}</span>
                )}
              </div>
            </div> */}
					</motion.div>
				)}

				{currentStep === 2 && (
					<motion.div
						initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<TermsCheckBoxes
							consentAndAgreements={consentAndAgreements}
							setConsentAndAgreements={setConsentAndAgreements}
						/>
						<button
							type="submit"
							className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none"
							onClick={handleSignUp}
						>
							Sign Up
						</button>
						<div className="w-full h-7 text-red-500 text-sm text-center font-bold">
							{error && <span>{error}</span>}
						</div>
					</motion.div>
				)}
			</form>

			<div className="mt-5 ">
				<div className="flex justify-between">
					<button
						type="button"
						onClick={prev}
						disabled={currentStep === 0}
						className="flex justify-center items-center rounded pr-2 bg-white w-[110px] h-[40px]  text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
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
						className="flex justify-center items-center rounded bg-white w-[110px] h-[40px]  pl-2 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
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
	);
}
