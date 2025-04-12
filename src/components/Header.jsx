"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "./auth/SignInModal";

const links = [
  {
    href: "about",
    label: "About",
  },
  {
    href: "syllabus",
    label: "Syllabus",
  },
  {
    href: "pricing",
    label: "Pricing",
  },
  {
    href: "faq",
    label: "FAQs",
  },
];

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [startWithSignUp, setStartWithSignUp] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (searchParams.get("signin") === "true") {
      setStartWithSignUp(false);
      setIsAuthModalOpen(true);
    }

    // Modified event listener to check for startWithSignUp detail
    const handleOpenModal = (event) => {
      console.log("Header received open-signin-modal event", event.detail);
      // Check if the event has a detail property indicating to start with sign-up
      setStartWithSignUp(event.detail?.startWithSignUp === true);
      setIsAuthModalOpen(true);
    };

    // Add event listener for sign up modal event
    const handleOpenSignUpModal = () => {
      console.log("Header received open-signup-modal event");
      setStartWithSignUp(true);
      setIsAuthModalOpen(true);
    };

    window.addEventListener("open-signin-modal", handleOpenModal);
    window.addEventListener("open-signup-modal", handleOpenSignUpModal);

    // Cleanup
    return () => {
      window.removeEventListener("open-signin-modal", handleOpenModal);
      window.removeEventListener("open-signup-modal", handleOpenSignUpModal);
    };
  }, [searchParams]);

  const navigationLinks = [
    ...(user
      ? [
          {
            href: "/my-courses",
            label: "Course",
            isFullPath: true,
            isCourseLink: true,
          },
          { href: "/profile", label: "Profile", isFullPath: true },
        ]
      : []),
    ...links,
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = (e, href) => {
    e.preventDefault();
    const element = document.getElementById(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false); // Close mobile menu if open
  };

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setStartWithSignUp(false);
      setIsAuthModalOpen(true);
    }
  };

  const cta = user ? (
    <button
      onClick={handleAuthClick}
      className={`btn ${
        isScrolled
          ? "bg-white hover:bg-emerald-100 text-emerald-700 text-sm py-1 px-2 rounded-md"
          : "bg-white hover:bg-emerald-100 text-emerald-700 text-md py-2 px-4 rounded-md"
      } transition-all duration-300 ease-in-out`}
    >
      Sign Out
    </button>
  ) : (
    <div className="flex gap-2">
      <button
        onClick={() => {
          setStartWithSignUp(false);
          setIsAuthModalOpen(true);
        }}
        className={`btn ${
          isScrolled
            ? "bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-1 px-2 rounded-md"
            : "bg-emerald-600 hover:bg-emerald-700 text-white text-md py-2 px-4 rounded-md"
        } transition-all duration-300 ease-in-out`}
      >
        Sign In
      </button>
    </div>
  );

  return (
    <>
      <div className="h-[72px]">
        {" "}
        {/* Spacer div to prevent content jump */}
        <header
          className={`${
            isScrolled ? "bg-[#181818] bg-opacity-95" : "bg-[#181818]"
          } fixed top-0 left-0 right-0 z-50 ${
            isScrolled ? "mr-6 ml-6" : ""
          } transition-all duration-300 ease-in-out ${
            isScrolled
              ? "rounded-md mx-4 my-2 shadow-lg py-2 border border-white"
              : "rounded-none mx-0 my-0 py-2"
          } shadow-none`}
        >
          <nav
            className={`container flex items-center justify-between px-${
              isScrolled ? "6" : "6"
            } py-${
              isScrolled ? "0" : "2"
            } mx-auto max-w-full lg:max-w-[90%] transition-all duration-300 ease-in-out ${
              isScrolled ? "rounded-lg shadow-lg" : "rounded-none"
            } shadow-none`}
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <Link
                className="flex items-center gap-2 shrink-0 text-white"
                href="/"
                // title={`${config.appName} homepage`}
              >
                <span
                  className={`font-extrabold ${
                    isScrolled
                      ? "text-xl md:text-2xl text-emerald-300"
                      : "text-2xl md:text-3xl text-emerald-400"
                  } transition-all duration-300 ease-in-out`}
                >
                  🐸 FroggoCodes
                </span>
              </Link>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2 inline-flex items-center justify-center rounded-md p-2"
                onClick={() => setIsOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex lg:justify-center lg:gap-10 lg:items-center">
              {navigationLinks.map((link) => (
                <a
                  href={link.isFullPath ? link.href : `#${link.href}`}
                  key={link.href}
                  onClick={(e) =>
                    !link.isFullPath && handleScroll(e, link.href)
                  }
                  className={`${
                    link.isCourseLink
                      ? "text-white hover:text-white hover:underline"
                      : "text-white hover:underline"
                  } cursor-pointer`}
                  title={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div>
          </nav>

          {/* Mobile menu */}
          <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
            <div
              className={`fixed inset-y-0 right-0 z-10 w-full px-6 py-3 overflow-y-auto bg-[#181818] sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300 ${
                isScrolled ? "rounded-lg shadow-lg" : "rounded-none"
              } shadow-none flex flex-col items-center`}
            >
              <div className="flex items-center justify-between w-full">
                <Link
                  className="flex items-center gap-0 shrink-0 text-white justify-center w-full"
                  title={`FroggoCodes homepage`}
                  href="/"
                >
                  <span className="font-extrabold text-lg text-center text-white">
                    🐸 FroggoCodes
                  </span>
                </Link>
                <button
                  type="button"
                  className="-m-4 rounded-md p-2 bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flow-root mt-6 w-full">
                <div className="py-4">
                  {/* // In the mobile menu section */}
                  <div className="flex flex-col gap-y-4 items-center text-white w-full">
                    {navigationLinks.map((link) => (
                      <a
                        href={link.isFullPath ? link.href : `#${link.href}`}
                        key={link.href}
                        onClick={(e) =>
                          !link.isFullPath && handleScroll(e, link.href)
                        }
                        className={`${
                          link.isCourseLink
                            ? "text-emerald-400 font-semibold hover:text-emerald-300"
                            : "text-emerald-500 hover:underline"
                        } w-full text-center cursor-pointer`}
                        title={link.label}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="divider"></div>
                <div className="flex flex-col items-center justify-center w-full">
                  {user ? (
                    <button
                      onClick={handleAuthClick}
                      className="w-full max-w-[200px] mx-auto bg-white hover:bg-emerald-100 text-emerald-700 text-md py-2 px-4 rounded-md transition-all duration-300 ease-in-out"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setStartWithSignUp(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full max-w-[200px] mx-auto bg-emerald-600 hover:bg-emerald-700 text-white text-md py-2 px-4 rounded-md transition-all duration-300 ease-in-out"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
      <SignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        startWithSignUp={startWithSignUp}
      />
    </>
  );
};

export default Header;
