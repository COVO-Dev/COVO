'use client'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image'; // Import Next.js Image component
import COVO_LOGO_URL from "@/assets/images/COVO_WHITE_NO_BG.png"; // Adjust the path as necessary
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { deactivateAccount } from "@/lib/api/decativate/deactivateAccount";

interface DeactivateAccountPageProps {
  onBack: () => void;
  onContinue: () => void;
  isSubmitting?: boolean; // Optional: for loading state in continue button
}
const formSchema = z.object({
  deactivationReason: z.string().min(1, {
    message: "Deactivation reason is required",
  }),
});

const DeactivateAccountPage: React.FC<DeactivateAccountPageProps> = ({ onBack, onContinue, isSubmitting = false }) => {
  const { data: session } = useSession();
  const token = session?.user?.access_token;
  const userId = session?.user?._id;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      const response = await deactivateAccount(token, userId, values);

      console.log(response);
      if (response.status === 'success') {
        toast({
          title: "Success",
          description: "Account Deactivated Successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: response.message,
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        title: "Error",
        // description: "Failed to submit the form. Please try again.",
        description: error.message,
        duration: 3000,
        variant: "destructive",
      });
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  return (
    <div
      className="flex flex-col items-center justify-center h-full md:min-h-[calc(100vh-64px)] bg-cover bg-center bg-no-repeat p-8"
    >
      {/* Main Content Area */}
      <Card className="w-full max-w-4xl shadow-2xl bg-white/5 border-white/10 lg:h-[80%] border-2 flex flex-col justify-center items-center ">
        <CardContent className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 p-0 h-full max-h-full ">
          {/* Left Side: Image */}
          <div className="p-2">
            <div className="w-full h-full flex items-center justify-center bg-black rounded-xl ">
              <Image
                src={COVO_LOGO_URL} // Replace with your image URL
                alt="Deactivation"
                width={500} // Adjust as needed
                height={400}
                className="rounded-lg object-cover p-4" // Added padding here
              />
            </div>
          </div>

          <section className="max-w-3xl max-h]  ">
            <Form {...form}>
              {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col justify-center mx-auto col-span-1 px-2 "> */}
              <form onSubmit={form.handleSubmit(() => onSubmit(form.getValues()))} className="space-y-4 lg:max-h-[590px] grid grid-rows-9 justify-center mx-auto col-span-1 px-2 ">
                {/* Right Side: Content */}

                {/* Styled Header Container */}
                <CardHeader className="text-left -2 border-red-500 row-span-2 ">
                  <h1 className="md:text-3xl lg:text-4xl text-4xl font-bold  tracking-tighter">
                    Deactivate Your Account
                  </h1>
                  {/* <p className="text-muted-foreground text-sm sm:text-base text-gray-300">
                        Are you sure you want to deactivate your account?
                      </p> */}
                </CardHeader>

                {/* Disclaimer */}
                {/* <div className="max-h-[67%] lg-md:max-h-[40%] lg-xl:max-h-[40%]  flex-1 border-2 border-blue-500 overflow-y-scroll w-full rounded-md bg-white/5 p-4"> */}
                <ScrollArea className="row-span-6 flex-1 overflow-y-scroll w-full rounded-md bg-white/5">
                  <Alert variant="destructive" className="border-destructive bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Disclaimer</AlertTitle>
                    <AlertDescription>
                      By deactivating your account, the following will occur:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your profile and personal information will be deactivated.</li>
                        <li>You will no longer be able to log in.</li>
                        <li>
                          Some data may be retained for a certain period as required by law or our
                          policies.
                        </li>
                        <li>This action may be irreversible.</li>
                      </ul>
                      <p className="mt-4">
                        Please ensure you understand the consequences before proceeding. If you have any
                        concerns, please contact our support team.
                      </p>
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="deactivationReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mt-2">Reason for deactivation </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder=""
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Mention why you want to deactivate your account</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </ScrollArea>

                {/* <div className="flex items-center justify-between border-2 border-green-500"> */}
                <div className="row-span-1 flex items-center justify-between ">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className={cn(
                      "flex items-center gap-2 w-full sm:w-auto",
                      "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
                      "border-secondary/30 shadow-md"
                    )}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    variant="destructive"
                    type="submit"
                    onClick={onContinue}
                    className={cn(
                      "w-full sm:w-auto",
                      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                      "shadow-lg"
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <>Deactivating...</> : <>Continue Deactivation</>}
                  </Button>
                </div>



              </form>
            </Form></section>
        </CardContent>
      </Card>


      {/* Footer (Optional) */}
      {/* <footer className="py-6 text-center text-muted-foreground text-sm text-gray-300">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </footer> */}

    </div >
  );
};

export default DeactivateAccountPage;

