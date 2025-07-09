import { Checkbox } from "@/components/ui/checkbox";
import { ICheckBoxesProps } from "./TermsCheckBoxes.model";
import Link from "next/link";

export default function TermsCheckBoxes({
	consentAndAgreements,
	setConsentAndAgreements,
	onErrorClear,
}: ICheckBoxesProps) {
	return (
		<div className="flex flex-col gap-2 mb-4">
			<div className="flex items-center space-x-2 origin-left scale-110">
				<Checkbox
					id="acceptAll"
					checked={
						consentAndAgreements.termsAccepted &&
						consentAndAgreements.dataComplianceConsent &&
						consentAndAgreements.marketingOptIn
					}
					onCheckedChange={(e) => {
						const checked = Boolean(e);
						setConsentAndAgreements({
							termsAccepted: checked,
							dataComplianceConsent: checked,
							marketingOptIn: checked,
						});
						onErrorClear?.();
					}}
				/>
				<label
					htmlFor="acceptAll"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Accept all terms and policies
				</label>
			</div>
			<div className="ml-4 flex flex-col gap-2">
				<div className="flex items-center space-x-2">
					<Checkbox
						id="termsAccepted"
						checked={consentAndAgreements.termsAccepted}
						onCheckedChange={(e) => {
							setConsentAndAgreements({
								...consentAndAgreements,
								termsAccepted: Boolean(e),
							});
							onErrorClear?.();
						}}
					/>
					<label
						htmlFor="termsAccepted"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						I agree to the{" "}
						<Link href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
							Terms and Conditions
						</Link>
						{" "}and{" "}
						<Link href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
							Privacy Policy
						</Link>
					</label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="dataComplianceConsent"
						checked={consentAndAgreements.dataComplianceConsent}
						onCheckedChange={(e) => {
							setConsentAndAgreements({
								...consentAndAgreements,
								dataComplianceConsent: Boolean(e),
							});
							onErrorClear?.();
						}}
					/>
					<label
						htmlFor="dataComplianceConsent"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						I consent to data processing as described in the{" "}
						<Link href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
							Privacy Policy
						</Link>
					</label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="marketingOptIn"
						checked={consentAndAgreements.marketingOptIn}
						onCheckedChange={(e) => {
							setConsentAndAgreements({
								...consentAndAgreements,
								marketingOptIn: Boolean(e),
							});
							onErrorClear?.();
						}}
					/>
					<label
						htmlFor="marketingOptIn"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Receive marketing emails
					</label>
				</div>
			</div>
		</div>
	);
}
