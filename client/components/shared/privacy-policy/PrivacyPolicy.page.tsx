import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground bg-gray-100">Privacy Policy</h1>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>{`
            This Privacy Policy (the “Policy”) sets forth the terms under which COVO (hereinafter
            referred to as “we,” “us,” or “the Company”) collects, processes, stores, and discloses
            personal and non-personal information of its users, in strict compliance with the Protection of
            Personal Information Act (POPIA) and any other applicable data protection legislation. By
            accessing or using the COVO platform (the “Platform”), users (hereinafter referred to as
            “you” or “the User”) consent to the practices described herein.
            ` }</AlertDescription>
        </Alert>

        <ScrollArea className="h-[600px] w-full rounded-md border">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">1. Collection of Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We collect and process the following categories of information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Personal Information: </strong>
                  This includes, but is not limited to, your full name, email
                  address, phone number, and any other information you voluntarily provide during the
                  registration process or while using the Platform
                </li>
                <li>
                  <strong>Organisational and Contact Information: </strong>
                  For brands, we collect information
                  related to your organisation, including decision-maker contact details, brand
                  information, and business roles. For influencers, we collect social media profiles,
                  public information, and relevant data related to your professional identity.
                </li>
                <li>
                  <strong>Usage Data: </strong>We automatically collect technical information such as your IP address,
                  browser type, operating system, and details of your interactions with the Platform
                  (e.g., pages visited, features used).
                </li>
                <li>
                  <strong>Campaign and Influencer Analytics: </strong> We collect and process data related to
                  campaign performance, influencer engagement, and metrics such as reach,
                  audience demographics, and engagement rates
                </li>
              </ul>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">2. Purpose of Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed mb-4">
                The information collected is processed for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Platform Functionality: </strong>
                  To provide services, such as facilitating connections
                  between influencers and brands, managing profiles, and ensuring efficient Platform
                  operations.
                </li>
                <li>
                  <strong>Campaign Management: </strong> To offer detailed analytics and insights regarding
                  campaign performance and influencer effectiveness, optimising brand-influencer
                  collaborations.
                </li>
                <li>
                  <strong>Communication: </strong>
                  {`To keep you informed about updates, notifications, and relevant
                  information about your account or the Platform’s services.
                   `}
                </li>
                <li>
                  <strong>Compliance: </strong>
                  {`To comply with applicable laws and regulations.`}
                </li>
                <li>
                  <strong>Marketing and Promotions: </strong>
                  {`To send relevant promotional materials and marketing
                content, subject to your consent, where required by law `}
                </li>
              </ul>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">3. Disclosure of Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed mb-4">
                We do not disclose your personal data to third parties except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Service Providers: </strong>
                  We may engage third-party service providers to perform
                  functions such as data hosting, analytics, and customer support. These third parties
                  are bound by confidentiality obligations.
                </li>
                <li>
                  <strong>Legal Requirements: </strong>
                  We may disclose your information if required by law or to
                  protect the rights, property, or safety of COVO, its users, or others.
                </li>
                <li>
                  <strong>Business Transactions: </strong>
                  {`In the event of a merger, acquisition, or sale of assets, your
            personal data may be transferred as part of that transaction, and you will be notified
            of any changes to the Policy.`}
                </li>
              </ul>

            </CardContent>


            <CardHeader>
              <CardTitle className="text-2xl font-semibold">4. Data Security and Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed mb-4">
                We implement strict security measures to protect your data from unauthorised access,
                disclosure, or destruction, including encryption, firewalls, and secure servers. While we strive
                to protect your personal data, no transmission method over the internet is completely secure,
                and we cannot guarantee absolute security.
              </p>
              <p className="text-base leading-relaxed mb-4">
                We retain personal data for as long as necessary to fulfil the purposes outlined in this Policy
                and comply with legal obligations. Once these purposes are achieved, the data will either be
                securely deleted or anonymized, as required by law
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">5. Data Subject Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed mb-4">{`
                In compliance with applicable data protection laws, you have the following rights:
              ` }
              </p>

              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Right of Access: </strong>
                  You may request access to the personal data we hold about you
                  and how it is processed.
                </li>
                <li>
                  <strong>Right to Rectification: </strong>
                  You may request the correction of any inaccurate or
                  incomplete information.
                </li>
                <li>
                  <strong>Right to Erasure: </strong>
                  You may request the deletion of your personal data, subject to
                  legal and contractual limitations.
                </li>
                <li>
                  <strong>Right to Object: </strong>
                  You may object to the processing of your data on legitimate
                  grounds.
                </li>
                <li>
                  <strong>Right to Restrict Processing: </strong>
                  You may request that we limit the processing of your
                  personal data in certain circumstances.
                </li>
              </ul>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">6. Consent and Lawfulness of Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                By providing your personal information and continuing to use the Platform, you consent to
                the collection, processing, and use of your data as described in this Policy. We ensure that
                personal data is processed lawfully, fairly, and transparently, in compliance with POPIA and
                other relevant data protection laws.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">7. Amendments to the Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We reserve the right to modify or update this Policy at any time. Users will be notified of any
                material changes through the Platform or via email. Your continued use of the Platform
                following such amendments constitutes acceptance of the revised terms.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">8. External Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                Our website may contain links to other websites we do not manage. We are not responsible
                for the content or privacy practices of these external sites. Please review their respective
                privacy policies before sharing any personal information
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">9. Use of Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We use cookies to collect information about your interactions with our website. Cookies are
                small data files stored on your device to help us recognize you during subsequent visits and
                understand how you navigate our site. This enables us to tailor content to your preferences.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">10. Publicly Available Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We may access and analyse information from publicly available sources using advanced
                tools. For example, we may identify common corporate email formats (e.g.,
                firstname.lastname@company.com) and use this information only after verifying its accuracy.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">11. Additional Information Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We may collect personal information when you engage with our website, such as entering
                competitions, signing up for updates, accessing content via mobile or web browser,
                contacting us through email or social media, or mentioning us on social platforms. This
                information may be used to personalise your experience, communicate with you, conduct
                analytics and market research, and develop our business.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">12. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                We may update this Privacy Policy to reflect changes in our business operations, industry
                standards, or legal requirements. We will notify you of any material changes, and if
                necessary, obtain your consent for new uses of your personal information.
              </p>
            </CardContent>

            <CardHeader>
              <CardTitle className="text-2xl font-semibold">13. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                For any inquiries or to exercise your data subject rights, please contact us at:
                <br />Email: <a href="mailto:privacy@covo.co.za" className="underline text-blue-700 hover:cursor-pointer">privacy@covo.co.za</a>
              </p>
            </CardContent>

          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
