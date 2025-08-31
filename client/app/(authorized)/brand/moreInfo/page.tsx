"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { brandUpdateDataRoute } from "@/lib/api/update-data/brand/brandUpdateData.route";
import { brandFormDataSchema } from "@/lib/api/update-data/brand/brandUpdateData.validation";
import { useRouter } from "next/navigation";
import undraw_fill_forms_npwp from "@/assets/svg/undraw_fill-forms_npwp.svg";
import getCurrentUserData from "@/utils/getCurrentUserData";
import { countries } from './CountryDialCodes.json';

type Inputs = z.infer<typeof brandFormDataSchema>;

const steps = [
  {
    id: "Step 1",
    name: "Company Details",
    fields: ["companyName", "companyWebsite", "position"],
  },
  {
    id: "Step 2",
    name: "Social & Payment",
    fields: ["businessType", "industry", "phoneNumber"],
  },
  {
    id: "Step 3",
    name: "Complete",
    fields: ["bio"],
  },
];

// const steps = [
//   {
//     id: "Step 1",
//     name: "Company Details",
//     fields: ["companyName", "companyWebsite", "position", "businessType", "industry", "logo"],
//   },
//   {
//     id: "Step 2",
//     name: "Social & Payment",
//     fields: ["socialMedia", "paymentDetails", "phoneNumber"],
//   },
//   {
//     id: "Step 3",
//     name: "Complete",
//     fields: ["bio"],
//   },
// ];

export default function BrandRegistration() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const delta = currentStep - previousStep;
  const { data: session } = useSession();
  const router = useRouter();
  const { update } = useSession();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = countries.find(
      (country) => country.alpha2 === e.target.value
    );
    setSelectedCountry(selected);
  };

  const { register, handleSubmit, trigger, formState: { errors }, watch, reset } = useForm<Inputs>({
    resolver: zodResolver(brandFormDataSchema),
  });

  const selectedIndustry = watch("industry");

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUserData();

      console.log("====================================");
      console.log("data: ", data);
      console.log("====================================");

      setUserData(data);

      reset({
        companyName: data.companyName || "",
        companyWebsite: data.companyWebsite || "",
        email: data.email || "",
        password: data.password || "",
        position: data.position || "",
        // logo: data.logo || "",
        industry: data.industry || "",
        phoneNumber: data.phoneNumber || "",
        campaigns: data.campaigns || [],
        businessType: data.businessType || "",
        // socialMedia: {
        //   instagram: data.socialMedia?.instagram || "",
        //   facebook: data.socialMedia?.facebook || "",
        //   linkedin: data.socialMedia?.linkedin || "",
        //   twitter: data.socialMedia?.twitter || "",
        // },
        // paymentDetails: {
        //   method: data.paymentDetails?.method || "",
        //   billingInfo: data.paymentDetails?.billingInfo || "",
        // },
        bio: data.bio || "",
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleAddMoreInfo = async (formData: Inputs) => {
    try {
      setError("");
      setSuccessMessage("");

      const token = session?.user?.access_token;
      const userId = session?.user?._id;

      if (!token) {
        throw new Error("Failed to retrieve access token from session.");
      }

      if (!userId) {
        throw new Error("Failed to retrieve user ID from session.");
      }

      // Combine the selected country's dial code with the phone number
      const fullPhoneNumber = `${selectedCountry.dialCode}${formData.phoneNumber}`;

      const updatedFormData = {
        ...formData,
        phoneNumber: fullPhoneNumber, // Replace phoneNumber with fullPhoneNumber
      };

      const result = await brandUpdateDataRoute(updatedFormData, token, userId);

      console.log("==============update==============");
      console.log("result: ", result);
      console.log("==============update==============");

      await update(
        {
          ...session,
          user: {
            ...session.user,
            ...result.data.data,
          },
        }
      );

      if (result.status === "error") {
        setError(result.message);
      } else {
        setSuccessMessage("Profile updated successfully!");

        setTimeout(() => {
          router.push("/brand/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error updating brand data:", err);
    }
  };


  // Navigation functions
  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as Array<keyof Inputs>, { shouldFocus: true });

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



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className='bg-[url("/svg/BG.svg")] flex-col flex md:p-[100px] p-[20px] justify-center items-center w-full h-full border-2 border-red-300 '>
      <div className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] rounded-md shadow-lg p-[30px] flex-col flex justify-center items-center w-full h-full border-4 border-red-400'>
        <div className="flex justify-center items-center w-full">
          <Image
            src={undraw_fill_forms_npwp}
            alt="Registration form illustration"
            width={200}
            height={200}
            className="w-[300px] h-auto bg-black/20 p-[20px] rounded-md"
          />
        </div>
        <br />
        {/* Form Steps Navigation */}
        <div className="max-w-[1060px] w-full h-auto">
          <nav aria-label='Progress' className="w-full">
            <ol role='list' className='flex space-x-0.5 space-y-0 w-auto'>
              {steps.map((step, index) => (
                <li key={step.name} className='flex-1'>
                  {currentStep > index ? (
                    <div className='group flex w-full flex-col border-sky-600 py-2 transition-colors border-l-0 border-t-4 pb-0 pl-0 pt-4'>
                      <span className='text-sm font-medium text-sky-600 transition-colors'>
                        {step.id}
                      </span>
                      <span className='text-sm font-medium'>{step.name}</span>
                    </div>
                  ) : currentStep === index ? (
                    <div
                      className='flex w-full flex-col text-center border-sky-600 py-2 border-l-0 border-t-4 pb-0 pl-0 pt-4'
                      aria-current='step'
                    >
                      <span className='text-sm font-medium text-sky-600'>
                        {step.id}
                      </span>
                      <span className='text-sm font-medium'>{step.name}</span>
                    </div>
                  ) : (
                    <div className='group flex w-full flex-col text-center border-gray-200 py-2 transition-colors border-l-0 border-t-4 pb-0 pl-0 pt-4'>
                      <span className='text-sm font-medium text-gray-500 transition-colors'>
                        {step.id}
                      </span>
                      <span className='text-sm font-medium'>{step.name}</span>
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
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
                  <input
                    {...register("companyName")}
                    placeholder="Company Name"
                    className={`${errors.companyName ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm">{errors.companyName.message}</p>
                  )}

                  <input
                    {...register("companyWebsite")}
                    placeholder="Company Website"
                    className={`${errors.companyWebsite ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                  />
                  {errors.companyWebsite && (
                    <p className="text-red-500 text-sm">{errors.companyWebsite.message}</p>
                  )}

                  <input
                    {...register("position")}
                    placeholder="Your Position"
                    className={`${errors.position ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm">{errors.position.message}</p>
                  )}

                  {/* <input
                    {...register("logo")}
                    placeholder="Logo URL"
                    className={`${errors.logo ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  />
                  {errors.logo && (
                    <p className="text-red-500 text-sm">{errors.logo.message}</p>
                  )} */}

                </div>
              </motion.div>
            )}

            {/* Step 2: Social & Payment */}
            {currentStep === 1 && (
              <motion.div
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
                  <select
                    {...register("businessType")}
                    className={`${errors.businessType ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  >
                    <option value="">Select Business Type</option>
                    <option value="SME">SME</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Start-up">Start-up</option>
                  </select>
                  {errors.businessType && (
                    <p className="text-red-500 text-sm">{errors.businessType.message}</p>
                  )}

                  <select
                    {...register("industry")}
                    className={`${errors.industry ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  >
                    <option value="">Select Industry</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Technology & Gadgets">Technology & Gadgets</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Travel & Hospitality">Travel & Hospitality</option>
                    <option value="Parenting & Family">Parenting & Family</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm">{errors.industry.message}</p>
                  )}
                  {selectedIndustry === "Other" && (
                    <input
                      {...register("industryOther")}
                      placeholder="Please specify"
                      className={`${errors.industryOther ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                    />
                  )}
                  {errors.industryOther && (
                    <p className="text-red-500 text-sm">{errors.industryOther.message}</p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      value={selectedCountry.alpha2}
                      onChange={handleCountryChange}
                      className="w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none"
                    >
                      {countries.map((country) => (
                        <option key={country.alpha2} value={country.alpha2}>
                          {country.flag} {country.name} ({country.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="flex items-center">
                      <span className="p-3 bg-gray-200 rounded-l-md border border-gray-300">
                        {selectedCountry.dialCode}
                      </span>
                      <input
                        {...register("phoneNumber")}
                        placeholder="Phone Number"
                        className={`${errors.phoneNumber ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} flex-1 p-3 rounded-r-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                      />
                    </div>
                    <div className="w-full h-5 text-red-500 text-xs">
                      {errors.phoneNumber && (
                        <span>{errors.phoneNumber.message}</span>
                      )}
                    </div>
                  </div>

                  {/* <input
                    {...register("socialMedia.instagram")}
                    placeholder="Instagram Profile"
                    className={`${errors.socialMedia?.instagram ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                  />
                  {errors.socialMedia?.instagram && (
                    <p className="text-red-500 text-sm">{errors.socialMedia.instagram.message}</p>
                  )}
                  <input
                    {...register("socialMedia.facebook")}
                    placeholder="Facebook Page"
                    className={`${errors.socialMedia?.facebook ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  />
                  {errors.socialMedia?.facebook && (
                    <p className="text-red-500 text-sm">{errors.socialMedia.facebook.message}</p>
                  )}
                  <input
                    {...register("socialMedia.linkedin")}
                    placeholder="LinkedIn Profile"
                    className={`${errors.socialMedia?.linkedin ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  />
                  {errors.socialMedia?.linkedin && (
                    <p className="text-red-500 text-sm">{errors.socialMedia.linkedin.message}</p>
                  )}
                  <input
                    {...register("socialMedia.twitter")}
                    placeholder="Twitter Handle"
                    className={`${errors.socialMedia?.twitter ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  />
                  {errors.socialMedia?.twitter && (
                    <p className="text-red-500 text-sm">{errors.socialMedia.twitter.message}</p>
                  )}
                  <select
                    {...register("paymentDetails.method")}
                    className={`${errors.paymentDetails?.method ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  >
                    <option value="">Select Payment Method</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Paystack">Paystack</option>
                    <option value="PayFast">PayFast</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.paymentDetails?.method && (
                    <p className="text-red-500 text-sm">{errors.paymentDetails.method.message}</p>
                  )}
                  <textarea
                    {...register("paymentDetails.billingInfo")}
                    placeholder="Billing Information"
                    className={`${errors.paymentDetails?.billingInfo ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                    rows={4}
                  />
                  {errors.paymentDetails?.billingInfo && (
                    <p className="text-red-500 text-sm">{errors.paymentDetails.billingInfo.message}</p>
                  )} */}
                </div>
              </motion.div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 2 && (
              <motion.div
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
                  <textarea
                    {...register("bio")}
                    placeholder="Company Bio"
                    className={`${errors.position ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

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
                        {...register("consentAndAgreements.dataComplianceConsent")}
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
                    <div className="success text-green-600 text-center">{successMessage}</div>
                  )}
                </div>
              </motion.div>
            )}
          </form>

          {/* Navigation Buttons */}
          <div className='mt-5'>
            <div className='flex justify-between'>
              <button
                type='button'
                onClick={prev}
                disabled={currentStep === 0}
                className='flex justify-center items-center rounded pr-2 bg-white w-[110px] h-[40px] text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-6 w-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.75 19.5L8.25 12l7.5-7.5'
                  />
                </svg>
                Previous
              </button>
              <button
                type='button'
                onClick={next}
                disabled={currentStep === steps.length - 1}
                className='flex justify-center items-center rounded bg-white w-[110px] h-[40px] pl-2 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Next
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-6 w-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8.25 4.5l7.5 7.5-7.5 7.5'
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