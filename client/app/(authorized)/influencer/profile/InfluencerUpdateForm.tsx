"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import undraw_fill_forms_npwp from "@/assets/svg/undraw_fill-forms_npwp.svg";
import { influencerUpdateDataRoute } from "@/lib/api/update-data/influencer/influencerUpdateData.route";
import { influencerFormDataSchema } from "@/lib/api/update-data/influencer/influencerUpdateData.validation";
import { useRouter } from "next/navigation";
import getCurrentUserData from "@/utils/getCurrentUserData";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdditionalInformationForm from "@/components/authorized/influencer/more-info/AdditionalInformationForm.component";




type Inputs = z.infer<typeof influencerFormDataSchema>;

const steps = [
  {
    id: "Step 1",
    name: "User Information",
    fields: ["firstName", "lastName", "email", "username", "password", "phoneNumber"],
  },
  {
    id: "Step 2",
    name: "Social Media Profiles",
    fields: ["socialMediaProfiles"],
  },
  {
    id: "Step 3",
    name: "Content & Location",
    fields: ["contentAndAudience", "profilePicture", "location", "personalBio"],
  },
  {
    id: "Step 4",
    name: "Consent and Agreements",
    fields: ["consentAndAgreements"],
  },
];

export default function InfluencerUpdateForm() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { update } = useSession();
  const [countriesData, setCountriesData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");




  const { register, handleSubmit, trigger, formState: { errors }, reset } = useForm<Inputs>({
    resolver: zodResolver(influencerFormDataSchema),
    defaultValues: {
      consentAndAgreements: {
        termsAccepted: false,
        marketingOptIn: false,
        dataComplianceConsent: false,
      },
      contentAndAudience: {
        brandGifting: false,
        paidCollaborationsOnly: false,
      },
    },
  });

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

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUserData();

      console.log("User data fetched:", data);

      setUserData(data);

      const country = data.location?.country || "";
      const city = data.location?.city || "";

      setSelectedCountry(country);
      setSelectedCity(city);

      const selectedCountryData = countriesData.find((c) => c.country === country);
      setCities(selectedCountryData ? selectedCountryData.cities : []);

      reset({
        firstName: data.firstName || "",
        lastname: data.lastName || "",
        email: data.email || "",
        username: data.username || "",
        phoneNumber: data.phoneNumber || "",
        socialMediaProfiles: {
          instagramHandle: data.socialMediaProfiles?.instagramHandle || "",
          youtubeChannelLink: data.socialMediaProfiles?.youtubeChannelLink || "",
          tiktokHandle: data.socialMediaProfiles?.tiktokHandle || "",
          twitterHandle: data.socialMediaProfiles?.twitterHandle || "",
          facebookPageLink: data.socialMediaProfiles?.facebookPageLink || "",
          linkedInProfile: data.socialMediaProfiles?.linkedInProfile || "",
          otherPlatforms: data.socialMediaProfiles?.otherPlatforms || [],
        },
        contentAndAudience: {
          primaryNiche: data.contentAndAudience?.primaryNiche || "",
          secondaryNiche: data.contentAndAudience?.secondaryNiche || "",
          contentSpecialisation: data.contentAndAudience?.contentSpecialisation || "",
          brandGifting: data.contentAndAudience?.brandGifting || false,
          paidCollaborationsOnly: data.contentAndAudience?.paidCollaborationsOnly || false,
          rateCardUpload: data.contentAndAudience?.rateCardUpload || "",
          mediaKitUpload: data.contentAndAudience?.mediaKitUpload || "",
        },
        profilePicture: data.profilePicture || "",
        location: {
          country: country,
          city: city,
        },
        personalBio: data.personalBio || "",
        referralSource: data.referralSource || "",
        consentAndAgreements: {
          termsAccepted: data.consentAndAgreements?.termsAccepted || false,
          marketingOptIn: data.consentAndAgreements?.marketingOptIn || false,
          dataComplianceConsent: data.consentAndAgreements?.dataComplianceConsent || false,
        },
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Fetch countries and cities data from API
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries");
        const data = await response.json();
        setCountriesData(data.data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchCountries();
  }, []);


  const handleCountryChange = (event) => {
    const country = event.target.value;
    setSelectedCountry(country);

    // Find the selected country's cities
    const selectedCountryData = countriesData.find((c) => c.country === country);
    setCities(selectedCountryData ? selectedCountryData.cities : []);

    // Reset city selection
    setSelectedCity("");
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

      const result = await influencerUpdateDataRoute(formData, token, userId);

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
        console.log("Success:", result.data);
        router.push("/influencer/profile");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error updating influencer data:", err);
    }
  };

  useEffect(() => {
    if (countriesData.length > 0) {
      loadUserData();
    }
  }, [countriesData]);


  return (
    <ScrollArea className="w-full h-[calc(100vh-270px)]">
      <div className='bg-[url("/svg/BG.svg")] flex-col flex md:p-[5px] p-[10px] justify-center items-center w-full h-full'>
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
        <div className="max-w-[1060px] w-full h-auto">
          {/* Progress Bar */}
          <div className="w-full h-[50px] flex justify-between items-center">
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
          </div>
          <br /><br />

          <form onSubmit={handleSubmit(handleAddMoreInfo)}>
            {/* Step 1: User Information */}
            {currentStep === 0 && (
              <motion.div initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className="space-y-4">
                  <div className="  w-auto flex justify-between">
                    <input {...register("firstName")} placeholder="First Name" className="mr-2  w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"

                    />
                    <input {...register("lastName")} placeholder="Last Name" className="  w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none focus:border-blue-500"

                    />
                  </div>
                  <input {...register("email")} placeholder="Email" className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input {...register("username")} placeholder="Username" className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />

                  <input {...register("phoneNumber")} placeholder="Phone Number" className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                </div>
              </motion.div>
            )}
            {/* Step 1: Social Media Profiles */}
            {currentStep === 1 && (
              <motion.div
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
                  <input
                    {...register("socialMediaProfiles.instagramHandle")}
                    placeholder="Instagram Handle"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input
                    {...register("socialMediaProfiles.youtubeChannelLink")}
                    placeholder="YouTube Channel Link"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input
                    {...register("socialMediaProfiles.tiktokHandle")}
                    placeholder="TikTok Handle"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input
                    {...register("socialMediaProfiles.twitterHandle")}
                    placeholder="Twitter Handle"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input
                    {...register("socialMediaProfiles.facebookPageLink")}
                    placeholder="Facebook Page Link"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none "
                  />
                  <input
                    {...register("socialMediaProfiles.linkedInProfile")}
                    placeholder="LinkedIn Profile"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Content & Location */}
            {currentStep === 2 && (
              <motion.div
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
                  <input
                    {...register("profilePicture")}
                    placeholder="Profile Picture URL"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
                  />

                  <div className="  w-auto justify-between flex space-x-4">

                    <select
                      {...register("contentAndAudience.primaryNiche")}
                      className={`${errors.contentAndAudience?.primaryNiche ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                    >
                      <option value="">Select Primary Niche</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Fitness & Sports">Fitness & Sports</option>
                      <option value="Technology & Gadgets">Technology & Gadgets</option>
                      <option value="Travel & Adventure">Travel & Adventure</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Home & Lifestyle">Home & Lifestyle</option>
                      <option value="Parenting & Family">Parenting & Family</option>
                      <option value="Finance & Business">Finance & Business</option>
                      <option value="Art & Design">Art & Design</option>
                      <option value="Education & Learning">Education & Learning</option>
                      <option value="Entertainment (Movies, TV, Music)">Entertainment (Movies, TV, Music)</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Sustainability & Eco-Living">Sustainability & Eco-Living</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Pets & Animals">Pets & Animals</option>
                      <option value="Personal Development & Motivation">
                        Personal Development & Motivation
                      </option>
                      <option value="Other">Other (for categories not listed; with limited flexibility for edge cases)</option>

                    </select>

                    <select
                      {...register("contentAndAudience.secondaryNiche")}
                      className={`${errors.contentAndAudience?.secondaryNiche ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                    >
                      <option value="">Select Primary Niche</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Fitness & Sports">Fitness & Sports</option>
                      <option value="Technology & Gadgets">Technology & Gadgets</option>
                      <option value="Travel & Adventure">Travel & Adventure</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Home & Lifestyle">Home & Lifestyle</option>
                      <option value="Parenting & Family">Parenting & Family</option>
                      <option value="Finance & Business">Finance & Business</option>
                      <option value="Art & Design">Art & Design</option>
                      <option value="Education & Learning">Education & Learning</option>
                      <option value="Entertainment (Movies, TV, Music)">Entertainment (Movies, TV, Music)</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Sustainability & Eco-Living">Sustainability & Eco-Living</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Pets & Animals">Pets & Animals</option>
                      <option value="Personal Development & Motivation">
                        Personal Development & Motivation
                      </option>
                      <option value="Other">Other (for categories not listed; with limited flexibility for edge cases)</option>

                    </select>
                  </div>

                  <select
                    {...register("contentAndAudience.contentSpecialisation")}
                    className={`${errors.contentAndAudience?.contentSpecialisation ? 'border-red-500 animate-shake' : 'border-custom-dark-desaturated-blue'} w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}

                  >
                    <option value="">Select Content Specialisation</option>
                    <option value="Sponsored Posts">Sponsored Posts</option>
                    <option value="Brand Partnerships">Brand Partnerships</option>
                    <option value="Product Reviews">Product Reviews</option>
                    <option value="Giveaways & Contests">Giveaways & Contests</option>
                    <option value="Event Coverage">Event Coverage</option>
                    <option value="Tutorials & How-To Guides">Tutorials & How-To Guides</option>
                    <option value="Educational Content">Educational Content</option>
                    <option value="Affiliate Marketing Content">Affiliate Marketing Content</option>
                    <option value="Unboxings">Unboxings</option>
                    <option value="Collaborations (with other influencers)">Collaborations (with other influencers)</option>
                    <option value="Vlogs (Video Blogs)">Vlogs (Video Blogs)</option>
                    <option value="Live Streams">Live Streams</option>
                    <option value="Challenges (e.g., TikTok or YouTube challenges)">
                      Challenges (e.g., TikTok or YouTube challenges)
                    </option>
                    <option value="Lifestyle & Daily Routine Content">Lifestyle & Daily Routine Content</option>
                    <option value="Interviews & Q&A Sessions">Interviews & Q&A Sessions</option>
                    <option value="Testimonials">Testimonials</option>
                    <option value="Behind-the-Scenes Content">Behind-the-Scenes Content</option>
                    <option value="Other">Other (optional field for specification)</option>

                  </select>

                  <div className="flex items-center ">
                    <input
                      {...register("contentAndAudience.brandGifting")}
                      type="checkbox"
                      className="mr-2"
                    />
                    <label>Open to Brand Gifting</label>
                  </div>

                  <div className="flex items-center ">
                    <input
                      {...register("contentAndAudience.paidCollaborationsOnly")}
                      type="checkbox"
                      className="mr-2"
                    />
                    <label>Paid Collaborations Only</label>
                  </div>


                  <div className="flex space-x-4 ">
                    {/* Country Dropdown */}
                    <div className="flex-1">
                      <select
                        {...register("location.country")}
                        onChange={handleCountryChange}
                        value={selectedCountry}
                        className={`${errors.location?.country ? "border-red-500 animate-shake" : "border-custom-dark-desaturated-blue"
                          } w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                      >
                        <option value="">Select Country</option>
                        {countriesData.map((country) => (
                          <option key={country.iso3} value={country.country}>
                            {country.country}
                          </option>
                        ))}
                      </select>
                      <div className="w-full h-5 text-red-500 text-xs">{errors.location?.country?.message}</div>
                    </div>

                    {/* City Dropdown */}
                    <div className="flex-1">
                      <select
                        {...register("location.city")}
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className={`${errors.location?.city ? "border-red-500 animate-shake" : "border-custom-dark-desaturated-blue"
                          } w-full p-3 rounded-md border bg-white/50 placeholder-gray-500 focus:outline-none`}
                      >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <div className="w-full h-5 text-red-500 text-xs">{errors.location?.city?.message}</div>
                    </div>

                  </div>

                  <textarea
                    {...register("personalBio")}
                    placeholder="Personal Bio (Optional)"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none"
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Terms and Submit */}
            {currentStep === 3 && (
              <motion.div
                initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-4">
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

                  <input
                    {...register("referralSource")}
                    placeholder="How did you hear about us? (Optional)"
                    className="w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 placeholder-gray-500 focus:outline-none mt-4"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none"
                >
                  Complete Registration
                </button>

                <div className="w-full h-7 text-red-500 text-sm text-center font-bold">
                  {error}
                </div>
                {successMessage && <div className="success text-green-600 text-center">{successMessage}</div>}

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

    </ScrollArea>
  );
}

// export default function InfluencerUpdateForm() {
//   return (
//     <AdditionalInformationForm />
//   )
// }