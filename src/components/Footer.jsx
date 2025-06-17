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
        <div className="flex flex-col md:flex-row justify-center md:justify-around items-center gap-10 md:gap-0">
          {" "}
          {/* Adjusted for side-by-side layout at md breakpoint and beyond */}
          <div className="text-center md:text-left">
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
                🐸 FroggoCodes
                {/* {config.appName} */}
              </strong>
            </Link>
            <p className="mt-2 text-sm text-white">Learn to code in 30 days.</p>
            <p className="mt-2 text-sm text-white">
              © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row justify-center items-center text-center text-white gap-4 md:gap-6 text-sm">
              {/* <Link href="/#pricing" className="link link-hover">
                Pricing
              </Link>
              <Link href="/my-courses" className="link link-hover">
                Courses
              </Link> */}
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
    </footer>
  );
};

export default Footer;
