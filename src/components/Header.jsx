"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  // {
  //   href: "contact",
  //   label: "Contact",
  // },
];

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  return user ? (
    <button
      onClick={signOut}
      className={`btn ${
        isScrolled
          ? "bg-white hover:bg-emerald-100 text-emerald-700 text-sm py-1 px-2 rounded-md"
          : "bg-white hover:bg-emerald-100 text-emerald-700 text-md py-2 px-4 rounded-md"
      } transition-all duration-300 ease-in-out`}
    >
      Sign Out
    </button>
  ) : (
    <Link href="/auth">
      <button
        className={`btn ${
          isScrolled
            ? "bg-white hover:bg-emerald-100 text-emerald-700 text-sm py-1 px-2 rounded-md"
            : "bg-white hover:bg-emerald-100 text-emerald-700 text-md py-2 px-4 rounded-md"
        } transition-all duration-300 ease-in-out`}
      >
        Sign In
      </button>
    </Link>
  );
};

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header
      className={`${
        isScrolled ? "bg-[#181818] bg-opacity-95" : "bg-[#181818]"
      } ${isScrolled ? "sticky top-2 z-50" : "sticky top-0 z-50"} ${
        isScrolled ? "mr-6 ml-6" : ""
      } transition-all duration-300 ease-in-out ${
        isScrolled
          ? "rounded-md mx-1 my-1 shadow-lg py-2 border border-white"
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
                isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-4xl"
              } transition-all duration-300 ease-in-out`}
            >
              🐸
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
          {links.map((link) => (
            <a
              href={`#${link.href}`}
              key={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-white hover:underline cursor-pointer"
              title={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:justify-end lg:flex-1">
          <AuthButton />
        </div>
      </nav>
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
                FroggoCodes 🐸
              </span>
            </Link>
            <button
              type="button"
              className="-m-4 rounded-md p-2 bg-transparent" // Changed background color to transparent
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-white" // Changed SVG color to white
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
              <div className="flex flex-col gap-y-4 items-center text-white w-full">
                {links.map((link) => (
                  <a
                    href={`#${link.href}`}
                    key={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                    className="text-emerald-500 hover:underline w-full text-center cursor-pointer"
                    title={link.label}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            <div className="flex flex-col w-full">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
