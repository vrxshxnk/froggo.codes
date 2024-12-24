import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | froggo.codes`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-full bg-[#181818] text-white mx-auto">
      <div className="w-7xl p-24">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>
        <h2 className="font-bold">Privacy Policy</h2>
        <h2 className="font-bold">Effective Date: January 1, 2025</h2>
        <br />
        Welcome to FroggoCodes, accessible from https://froggo.codes
        (&quot;Website&quot;). Your privacy is important to us, and this Privacy
        Policy outlines how we collect, use, and protect your information.
        <br />
        <br />
        <h2 className="font-bold">1. Information We Collect</h2>
        - Personal Data: We collect personal data such as your name, email
        address, and payment information.
        <br />
        - Non-Personal Data: We collect non-personal data through web cookies.
        <br />
        <br />
        <h2 className="font-bold">2. Purpose of Data Collection</h2>
        We collect your data for the purpose of order processing.
        <br />
        <br />
        <h2 className="font-bold">3. Data Sharing</h2>
        We do not share your data with any other parties.
        <br />
        <br />
        <h2 className="font-bold">4. Children's Privacy</h2>
        We do not collect any data from children.
        <br />
        <br />
        <h2 className="font-bold">5. Updates to the Privacy Policy</h2>
        We may update this Privacy Policy from time to time. Users will be
        notified of any changes via email.
        <br />
        <br />
        <h2 className="font-bold">6. Contact Information</h2>
        If you have any questions about these Privacy Policies, and Terms &
        Services, please contact us at
        <span className="font-bold"> hi@froggo.codes </span>
        <br />
        <br />
        Thank you for reading. Have a wonderful day ahead!
      </div>
    </main>
  );
};

export default PrivacyPolicy;
