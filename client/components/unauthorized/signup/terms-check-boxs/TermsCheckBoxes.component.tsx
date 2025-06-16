import { Checkbox } from "@/components/ui/checkbox";
import { ICheckBoxesProps } from "./TermsCheckBoxes.model";

export default function TermsCheckBoxes({
	consentAndAgreements,
	setConsentAndAgreements,
}: ICheckBoxesProps) {
	return (
		<ul className="flex flex-col gap-2 mb-4">
			<li className="flex items-center space-x-2 origin-left scale-110">
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
					}}
				/>
				<label
					htmlFor="acceptAll"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Accept terms and conditions
				</label>
			</li>
			<ul className="ml-4 flex flex-col gap-2">
				<li className="flex items-center space-x-2">
					<Checkbox
						id="termsAccepted"
						checked={consentAndAgreements.termsAccepted}
						onCheckedChange={(e) =>
							setConsentAndAgreements({
								...consentAndAgreements,
								termsAccepted: Boolean(e),
							})
						}
					/>
					<label
						htmlFor="termsAccepted"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Accept terms and conditions
					</label>
				</li>
				<li className="flex items-center space-x-2">
					<Checkbox
						id="dataComplianceConsent"
						checked={consentAndAgreements.dataComplianceConsent}
						onCheckedChange={(e) =>
							setConsentAndAgreements({
								...consentAndAgreements,
								dataComplianceConsent: Boolean(e),
							})
						}
					/>
					<label
						htmlFor="dataComplianceConsent"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Accept data compliance consent
					</label>
				</li>
				<li className="flex items-center space-x-2">
					<Checkbox
						id="marketingOptIn"
						checked={consentAndAgreements.marketingOptIn}
						onCheckedChange={(e) => {
							setConsentAndAgreements({
								...consentAndAgreements,
								marketingOptIn: Boolean(e),
							});
						}}
					/>
					<label
						htmlFor="marketingOptIn"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Receive marketing emails
					</label>
				</li>
			</ul>
		</ul>
	);
}
