import { Checkbox } from "@/components/ui/checkbox";
import { ICheckBoxesProps } from "./TermsCheckBoxes.model";

export default function TermsCheckBoxes({
  consentAndAgreements,
  setConsentAndAgreements,
  privacyPolicy,
  privacyPolicyChange,
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
			privacyPolicyChange?.(checked);
            onErrorClear?.();
          }}
        />
        <label
          htmlFor="acceptAll"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
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
            Accept terms and conditions
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
            Accept data compliance consent
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacyPolicy"
            checked={privacyPolicy}
            onCheckedChange={(e) => {
			  if (privacyPolicyChange) {
				privacyPolicyChange(Boolean(e));
			  }
              onErrorClear?.();
            }}
          />
          <label
            htmlFor="privacyPolicy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Privacy Policy
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
