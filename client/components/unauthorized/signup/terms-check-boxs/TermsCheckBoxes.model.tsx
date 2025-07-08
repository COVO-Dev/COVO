export interface ICheckBoxesProps {
	consentAndAgreements: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	};
	privacyPolicy: boolean;
	setConsentAndAgreements: (prev: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	}) => void;
	privacyPolicyChange?: (checked: boolean) => void;
	onErrorClear?: () => void;
}
