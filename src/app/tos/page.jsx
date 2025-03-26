import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
// import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | froggo.codes`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for FroggoCodes
        </h1>
        {/* prettier-ignore */}
        <h2 className="font-bold"> Terms & Services </h2>
        <h2 className="font-bold"> Effective Date: January 1, 2025 </h2>
        <br />
        Welcome to FroggoCodes, operated by froggo.codes (&quot;Website&quot;).
        By accessing or using our Website, you agree to comply with and be bound
        by the following terms and conditions (&quot;Terms & Services&quot;). If
        you do not agree with these terms, please do not use our Website.
        <br />
        <br />
        <h2 className="font-bold"> 1. Ownership and Usage </h2>
        When purchasing a course/package from FroggoCodes, you are granted the
        right to use the course solely for educational purposes. You have the
        right to view the course, but you do not have the right to resell it in
        any form.
        <br />
        <br />
        <h2 className="font-bold"> 2. Refund Policy </h2>
        We offer no refunds due to the nature of the product. The product being
        downloadable videos that can be copied, stored, used, and sold, which is
        prohibited in lieu of these terms.
        <br />
        <br />
        <h2 className="font-bold"> 3. Data Collection </h2>
        We collect personal data such as your name, email address, and payment
        information. We also collect non-personal data through web cookies. For
        more details, please review our Privacy Policy at
        https://froggo.codes/privacy-policy.
        <br />
        <br />
        <h2 className="font-bold"> 4. No Guarantees or Warranties </h2>
        FroggoCodes does not guarantee or warrant that our products or services
        will meet your expectations or that the operation of our products will
        be a 100% uninterrupted or error-free. We provide our products and
        services &quot;as is&quot; without any warranties of any kind.
        <br />
        <br />
        FroggoCodes does not guarantee that the user will get a job after buying
        or completing the course, and provides no service for providing jobs or
        any form of employement to the user.
        <br />
        <br />
        FroggoCodes is in no way liable for providing employement, services
        regarding employement, consultancy, referrals, or any related services.
        <br />
        <br />
        <h2 className="font-bold"> 5. Limitation of Liability </h2>
        FroggoCodes holds no liability for any damages arising from the use of
        our software. You agree that we are not responsible for any content or
        its usage.
        <br />
        <br />
        <h2 className="font-bold"> 6. Updates to Terms & Services </h2>
        We may update these Terms & Services from time to time. Users will be
        notified of any changes via email.
        <br />
        <br />
        <h2 className="font-bold"> 7. Governing Law </h2>
        These Terms & Services are governed by and construed in accordance with
        the laws of India.
        <br />
        <br />
        <h2 className="font-bold">Contact Information:</h2>
        If you have any questions about these Terms & Services, please contact
        us at
        <span className="font-bold"> hi@froggo.codes </span>
        <br />
        <br />
        Thank you for reading. Have a wonderful day ahead!
      </div>
    </main>
  );
};

export default TOS;
