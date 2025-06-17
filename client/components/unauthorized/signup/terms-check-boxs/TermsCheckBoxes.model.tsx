export interface ICheckBoxesProps {
	consentAndAgreements: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	};
	setConsentAndAgreements: (prev: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	}) => void;
}
