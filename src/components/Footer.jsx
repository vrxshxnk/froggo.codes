import Link from "next/link";
import Image from "next/image";
// import config from "@/config";
// import logo from "@/app/icon.png";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 border-t border-base-content/10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {" "}
        {/* Reduced max-width and padding for overall footer width adjustment */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          {" "}
          {/* Adjusted for side-by-side layout at md breakpoint and beyond */}
          <div className="text-center md:text-left flex-1">
            {" "}
            {/* Flex-1 for even spacing */}
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center text-white"
            >
              {/* <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              /> */}
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                PyPy_Codes
                {/* {config.appName} */}
              </strong>
            </Link>
            <p className="mt-3 text-sm text-white">Learn to code in 30 days.</p>
            <p className="mt-3 text-sm text-white">
              © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
          <div className="flex-1 sm:text-center">
            {" "}
            {/* Flex-1 for even spacing */}
            <div className="w-full sm:px-4 items-center justify-center sm:text-center">
              <div className="flex flex-col md:flex-row justify-around sm:items-center sm:text-center sm:justify-center text-white gap-4 mb-4 md:mb-0 text-sm">
                {" "}
                {/* Adjusted for side-by-side layout and spacing of links */}
                {/* {config.mailgun.supportEmail && (
                  <a
                    href={`mailto:${config.mailgun.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    Support
                  </a>
                )} */}
                {/* <Link href="/#pricing" className="link link-hover">
                  Pricing
                </Link> */}
                {/* <a href="/#" target="_blank" className="link link-hover">
                  Affiliates
                </a> */}
                <Link href="/tos" className="link link-hover">
                  Terms of services
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  Privacy policy
                </Link>
                <a href="mailto:hi@froggo.codes" className="link link-hover">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
