"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Hero = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const texts = [
    "To Rule Them All.",
    "makes you job ready.",
    "helps you build a SaaS.",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((index) => (index + 1) % texts.length);
        setIsTransitioning(false);
      }, 500); // Half a second for transition out before changing text
    }, 4000); // Change text every 4 seconds

    return () => clearInterval(intervalId);
  }, [texts.length]);

  const handleButtonClick = () => {
    if (user) {
      router.push("/my-courses");
    } else {
      console.log(
        "Hero button clicked, dispatching open-signin-modal event with signup form"
      );
      window.dispatchEvent(
        new CustomEvent("open-signin-modal", {
          detail: { startWithSignUp: true },
        })
      );
    }
  };

  return (
    <div className="align-middle overflow-hidden">
      <div
        id="about"
        className="max-w-7xl mx-auto bg-[#181818] flex flex-col items-center justify-center px-8 py-12 lg:py-18 min-h-screen relative"
      >
        {/* Animated frog-like gradient effects - modified for more abrupt jumping */}
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-emerald-600/50 rounded-full blur-2xl opacity-30 animate-frog-jump-big"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-emerald-600/50 rounded-full blur-2xl opacity-25 animate-frog-jump-small"></div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mt-[-5vh]">
          {/* Main heading with animation */}
          <h1 className="font-extrabold text-5xl md:text-6xl lg:text-7xl text-white tracking-normal leading-normal animate-fade-in">
            One Bootcamp
            <br className="mb-3" />
            <span className="flex items-baseline mt-4">
              <span className="custom-text-transition-container ml-2 inline-flex">
                <span
                  className={`custom-text-transition ${
                    isTransitioning ? "transition-out" : "transition-in"
                  }`}
                >
                  {texts[index]}
                </span>
              </span>
            </span>
          </h1>

          {/* Subheading with staggered animation */}
          <p className="text-lg md:text-xl lg:text-2xl text-white opacity-80 leading-relaxed my-6 max-w-3xl animate-fade-in-delayed">
            <span className="block mb-4 transform hover:translate-x-1 transition-transform duration-300">
              Go from zero to building AI-powered SaaS products.{" "}
              <span className="underline underline-offset-4 decoration-emerald-500">
                In 30 days.
              </span>
            </span>
          </p>

          {/* CTA button with animation */}
          <button
            onClick={handleButtonClick}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-emerald-600 px-8 py-4 text-lg font-bold text-white transition duration-300 ease-out hover:bg-emerald-700 animate-fade-in-delayed-more"
          >
            <span className="relative">
              {user ? "Go To Course" : "Supercharge My Career"}
            </span>
          </button>
        </div>
      </div>

      {/* Add custom animations for frog-like jumps */}
      <style jsx global>{`
        .custom-text-transition-container {
          position: relative;
          min-height: 1.2em;
          overflow: hidden;
          display: inline-flex;
          align-items: baseline;
          line-height: inherit;
        }

        .custom-text-transition {
          display: inline-block;
          color: #10b981;
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
          transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55),
            opacity 0.5s ease;
          line-height: inherit;
        }

        .transition-in {
          transform: translateY(0);
          opacity: 1;
        }

        .transition-out {
          transform: translateY(-20px);
          opacity: 0;
        }

        @keyframes frogJumpBig {
          /* Initial state and end state */
          0%,
          100% {
            transform: translateX(0) translateY(0) scaleY(1) scaleX(1);
            animation-timing-function: ease-in-out;
          }

          /* Charging phase - compress vertically, expand horizontally slightly */
          12% {
            transform: translateX(0) translateY(10px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }

          /* Explosive jump - sudden movement in arc */
          20% {
            transform: translateX(-80px) translateY(-120px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }

          /* Peak of jump - stretch more vertically at apex */
          30% {
            transform: translateX(-120px) translateY(-180px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }

          /* Start falling - begin to compress horizontally */
          40% {
            transform: translateX(-150px) translateY(-100px) scaleY(1.1)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.3, 0.4, 0.7, 0.8);
          }

          /* Impact with ground - significant compression */
          50% {
            transform: translateX(-170px) translateY(0) scaleY(0.75) scaleX(1.2);
            animation-timing-function: ease-out;
          }

          /* Small bounce after landing */
          55% {
            transform: translateX(-170px) translateY(-30px) scaleY(1.1)
              scaleX(0.95);
            animation-timing-function: ease-in;
          }

          /* Second landing */
          60% {
            transform: translateX(-170px) translateY(0) scaleY(0.9) scaleX(1.05);
            animation-timing-function: ease-out;
          }

          /* Charging for return jump */
          70% {
            transform: translateX(-170px) translateY(8px) scaleY(0.85)
              scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }

          /* Return jump - moving back toward original position */
          75% {
            transform: translateX(-100px) translateY(-90px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }

          /* Peak of return jump */
          82% {
            transform: translateX(-50px) translateY(-120px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }

          /* Landing from return jump */
          90% {
            transform: translateX(0) translateY(0) scaleY(0.8) scaleX(1.1);
            animation-timing-function: ease-out;
          }

          /* Return to normal and rest */
          95% {
            transform: translateX(0) translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-in-out;
          }
        }

        @keyframes frogJumpSmall {
          /* Initial state and end state */
          0%,
          100% {
            transform: translateX(0) translateY(0) scaleY(1) scaleX(1);
            animation-timing-function: ease-in-out;
          }

          /* Charging phase delayed compared to big blob */
          25% {
            transform: translateX(0) translateY(8px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }

          /* Explosive jump - arc in opposite direction */
          33% {
            transform: translateX(60px) translateY(-80px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }

          /* Peak of jump */
          40% {
            transform: translateX(100px) translateY(-110px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }

          /* Start falling */
          48% {
            transform: translateX(120px) translateY(-60px) scaleY(1.1)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.3, 0.4, 0.7, 0.8);
          }

          /* Impact with ground */
          55% {
            transform: translateX(130px) translateY(0) scaleY(0.75) scaleX(1.2);
            animation-timing-function: ease-out;
          }

          /* Small bounce */
          60% {
            transform: translateX(130px) translateY(-20px) scaleY(1.1)
              scaleX(0.95);
            animation-timing-function: ease-in;
          }

          /* Second landing */
          63% {
            transform: translateX(130px) translateY(0) scaleY(0.85) scaleX(1.05);
            animation-timing-function: ease-in-out;
          }

          /* Charging for return jump */
          75% {
            transform: translateX(130px) translateY(6px) scaleY(0.8) scaleX(1.1);
            animation-timing-function: cubic-bezier(0.2, 0, 0.8, 0.2);
          }

          /* Return jump */
          80% {
            transform: translateX(80px) translateY(-70px) scaleY(1.15)
              scaleX(0.9);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.85, 0.4);
          }

          /* Peak of return jump */
          85% {
            transform: translateX(40px) translateY(-90px) scaleY(1.2)
              scaleX(0.85);
            animation-timing-function: cubic-bezier(0.4, 0.1, 0.7, 0.3);
          }

          /* Landing from return jump */
          92% {
            transform: translateX(0) translateY(0) scaleY(0.75) scaleX(1.15);
            animation-timing-function: ease-out;
          }

          /* Return to normal and rest */
          96% {
            transform: translateX(0) translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-in-out;
          }
        }

        .animate-frog-jump-big {
          animation: frogJumpBig 7s infinite;
          transform-origin: bottom center;
        }

        .animate-frog-jump-small {
          animation: frogJumpSmall 6s infinite;
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  );
};

export default Hero;
