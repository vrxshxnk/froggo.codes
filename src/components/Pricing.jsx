// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// const Feature = ({ text }) => {
//   return (
//     <li className="flex items-start">
//       <svg
//         className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M5 13l4 4L19 7"
//         />
//       </svg>
//       <span className="text-white/80">{text}</span>
//     </li>
//   );
// };

// const Pricing = () => {
//   const router = useRouter();
//   // State for location-based pricing
//   const [isIndianUser, setIsIndianUser] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Function to handle sign-in click
//   const handleSignInClick = () => {
//     // Directly dispatch the event that Header is listening for
//     const event = new CustomEvent("open-signin-modal");
//     window.dispatchEvent(event);
//   };

//   useEffect(() => {
//     // Function to detect user's location
//     const detectLocation = async () => {
//       try {
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         setIsIndianUser(data.country_code === "IN");
//       } catch (error) {
//         console.error("Error detecting location:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     detectLocation();
//   }, []);

//   // Pricing details based on location
//   const priceDetails = {
//     regular: isIndianUser ? "₹9,999" : "$599",
//     discounted: isIndianUser ? "₹4,999" : "$299",
//     percentage: "50%",
//     currency: isIndianUser ? "₹" : "$",
//   };

//   return (
//     <section
//       className="bg-neutral-800 text-white flex flex-col justify-center items-center"
//       id="pricing"
//     >
//       <div className="max-w-7xl mx-auto px-8 py-8 md:py-16 text-center">
//         <span className="leading-loose text-5xl"> 💰 💰 💰 </span>
//         <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-4xl tracking-tight leading-normal">
//           Don't Miss The Next Big Opportunity...
//         </h2>

//         <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-green-400 max-w-4xl mx-auto font-extrabold text-4xl md:text-7xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
//           Join Now.
//         </h2>

//         <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20">
//           {/* Pricing Card */}
//           <div className="w-full max-w-md lg:max-w-lg relative">
//             {/* Badge */}
//             <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white font-bold py-1 px-6 rounded-full text-sm z-10">
//               LIMITED TIME OFFER
//             </div>

//             {/* Card with hover effect */}
//             <div className="relative bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-emerald-400/30 rounded-xl p-8 md:p-10 flex flex-col transition-transform duration-300 overflow-hidden">
//               {/* Card content */}
//               <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-teal-400 mb-6 mt-4">
//                 Zero To Hero Bootcamp
//               </h3>

//               {/* Price content */}
//               {isLoading ? (
//                 <div className="h-16 flex items-center justify-center">
//                   <div className="animate-pulse bg-neutral-700 h-10 w-32 rounded"></div>
//                 </div>
//               ) : (
//                 <div className="mb-8">
//                   <div className="flex flex-col items-center">
//                     <div className="flex items-baseline mb-1">
//                       <span className="text-5xl font-extrabold text-white">
//                         {priceDetails.discounted}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-2xl text-white/50 line-through">
//                         {priceDetails.regular}
//                       </span>
//                       <span className="bg-emerald-400/20 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded">
//                         {priceDetails.percentage} OFF
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Enhanced button with better styling */}
//               <button
//                 // onClick={handleSignInClick}
//                 onClick={() => {
//                   console.log(
//                     "Hero button clicked, dispatching open-signin-modal event"
//                   );
//                   // Directly set the auth modal open state in the Header component
//                   window.dispatchEvent(new CustomEvent("open-signin-modal"));
//                 }}
//                 className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-lg text-lg transition-all duration-200 mb-8 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group"
//               >
//                 <span className="relative z-10">Enroll Now</span>
//                 {/* <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span> */}
//               </button>

//               <div className="flex justify-center space-x-8 border-t border-neutral-700 pt-6">
//                 <div className="text-center w-24">
//                   <div className="flex items-center justify-center h-14">
//                     <span className="text-4xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
//                       30+
//                     </span>
//                   </div>
//                   <div className="text-sm text-white/70 mt-2">
//                     Video Lessons
//                   </div>
//                 </div>
//                 <div className="text-center w-24">
//                   <div className="flex items-center justify-center h-14">
//                     <span className="text-4xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
//                       10+
//                     </span>
//                   </div>
//                   <div className="text-sm text-white/70 mt-2">Projects</div>
//                 </div>
//                 <div className="text-center w-24">
//                   <div className="flex items-center justify-center h-14">
//                     <span className="text-6xl font-bold bg-gradient-to-l from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
//                       ∞
//                     </span>
//                   </div>
//                   <div className="text-sm text-white/70 mt-2">
//                     Opportunities
//                   </div>
//                 </div>
//               </div>

//               {/* Shine effect - explicitly using ::after pseudo-element */}
//               <div className="absolute inset-0 overflow-hidden rounded-xl">
//                 <div className="absolute inset-0 hidden h-full w-full hover:inline-block">
//                   <div className="absolute inset-0 -translate-x-full animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Features List */}
//           <div className="w-full max-w-md lg:max-w-lg text-left flex flex-col justify-between h-full">
//             <div>
//               <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">
//                 Want to find a job? Or Build a startup?
//               </h3>

//               <ul className="space-y-4">
//                 <Feature text="Go from Zero to Advanced" />
//                 {/* <Feature text="50+ Hours of Course Content" /> */}
//                 <Feature text="Build Real-World Projects" />
//                 <Feature text="Learn Web Development with NextJS" />
//                 <Feature text="Learn How to Use AI in Your Projects" />
//                 <Feature text="Learn Data Structures and Algorithms" />
//                 <Feature text="Learn Job-Ready Skills & Interview Prep" />
//                 <Feature text="Get Lifetime Access to Updates" />
//                 <Feature text="Get a Certificate of Completion" />
//               </ul>
//             </div>

//             <div className="mt-8 p-4 bg-neutral-700/30 border border-neutral-600 rounded-lg">
//               <p className="flex items-center text-white/80">
//                 <svg
//                   className="w-5 h-5 mr-4 text-emerald-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 Join thousands of developers who have transformed their careers
//                 building SaaS products.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* <div className="mt-20">
//           <div className="bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-2xl overflow-hidden shadow-lg">
//             <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
//               <div className="text-center md:text-left">
//                 <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
//                   Ready to transform your career?
//                 </h2>
//                 <p className="text-white/70 text-lg max-w-xl">
//                   Join thousands of successful developers who started with our
//                   comprehensive Python bootcamp.
//                 </p>
//               </div>
//               <div className="flex-shrink-0">
//                 <button className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors whitespace-nowrap">
//                   Enroll Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div> */}
//       </div>

//       <style jsx>{`
//         @keyframes shine {
//           from {
//             transform: translateX(-100%);
//           }
//           to {
//             transform: translateX(100%);
//           }
//         }

//         .card::after {
//           content: "";
//           position: absolute;
//           top: 0;
//           right: 0;
//           bottom: 0;
//           left: 0;
//           background: linear-gradient(
//             to right,
//             transparent,
//             rgba(255, 255, 255, 0.2),
//             transparent
//           );
//           transform: translateX(-100%);
//           opacity: 0;
//           transition: opacity 0.1s;
//         }

//         .card:hover::after {
//           animation: shine 1s ease-in-out;
//           opacity: 1;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Pricing;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Feature = ({ text }) => {
  return (
    <li className="flex items-start">
      <svg
        className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-white/80">{text}</span>
    </li>
  );
};

const Pricing = () => {
  const router = useRouter();
  const { user } = useAuth();
  // State for location-based pricing
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to detect user's location
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setIsIndianUser(data.country_code === "IN");
      } catch (error) {
        console.error("Error detecting location:", error);
      } finally {
        setIsLoading(false);
      }
    };

    detectLocation();
  }, []);

  // Pricing details based on location
  const priceDetails = {
    regular: isIndianUser ? "₹9,999" : "$499",
    discounted: isIndianUser ? "₹4,999" : "$249",
    percentage: "50%",
    currency: isIndianUser ? "₹" : "$",
  };

  const handleButtonClick = () => {
    if (user) {
      router.push("/my-courses");
    } else {
      console.log(
        "Pricing button clicked, dispatching open-signin-modal event"
      );
      window.dispatchEvent(new CustomEvent("open-signin-modal"));
    }
  };

  return (
    <section
      className="bg-neutral-800 text-white flex flex-col justify-center items-center"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16 text-center">
        <span className="leading-loose text-5xl"> 💰 💰 💰 </span>
        <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-4xl tracking-tight leading-normal">
          Don&apos;t Miss The Next Big Opportunity...
        </h2>

        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-green-400 max-w-4xl mx-auto font-extrabold text-4xl md:text-7xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
          Join Now.
        </h2>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20">
          {/* Pricing Card */}
          <div className="w-full max-w-md lg:max-w-lg relative">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white font-bold py-1 px-6 rounded-full text-sm z-10">
              LIMITED TIME OFFER
            </div>

            {/* Card with hover effect */}
            <div className="relative bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-emerald-400/30 rounded-xl p-8 md:p-10 flex flex-col transition-transform duration-300 overflow-hidden">
              {/* Shine effect - explicitly using ::after pseudo-element - MOVED UP AND ADDED pointer-events-none */}
              <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute inset-0 hidden h-full w-full hover:inline-block pointer-events-none">
                  <div className="absolute inset-0 -translate-x-full animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Card content */}
              <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-teal-400 mb-6 mt-4">
                Zero To Hero Bootcamp
              </h3>

              {/* Price content */}
              {isLoading ? (
                <div className="h-16 flex items-center justify-center">
                  <div className="animate-pulse bg-neutral-700 h-10 w-32 rounded"></div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline mb-1">
                      <span className="text-5xl font-extrabold text-white">
                        {priceDetails.discounted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl text-white/50 line-through">
                        {priceDetails.regular}
                      </span>
                      <span className="bg-emerald-400/20 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded">
                        {priceDetails.percentage} OFF
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced button with better styling - Made fully clickable */}
              <button
                onClick={handleButtonClick}
                className="w-full inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-lg text-lg transition-all duration-200 mb-8 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group"
              >
                <span className="relative">
                  {user ? "Go To Course" : "Enroll Now"}
                </span>
              </button>

              <div className="flex justify-center space-x-8 border-t border-neutral-700 pt-6">
                <div className="text-center w-24">
                  <div className="flex items-center justify-center h-14">
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
                      30+
                    </span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">
                    Video Lessons
                  </div>
                </div>
                <div className="text-center w-24">
                  <div className="flex items-center justify-center h-14">
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
                      10+
                    </span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">Projects</div>
                </div>
                <div className="text-center w-24">
                  <div className="flex items-center justify-center h-14">
                    <span className="text-6xl font-bold bg-gradient-to-l from-green-300 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-md">
                      ∞
                    </span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">
                    Opportunities
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="w-full max-w-md lg:max-w-lg text-left flex flex-col justify-between h-full">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">
                Want to find a job? Or Build a startup?
              </h3>

              <ul className="space-y-4">
                <Feature text="Go from Zero to Advanced" />
                <Feature text="Build Real-World Projects" />
                <Feature text="Learn Web Development with NextJS" />
                <Feature text="Learn How to Use AI in Your Projects" />
                <Feature text="Learn Data Structures and Algorithms" />
                <Feature text="Learn Job-Ready Skills & Interview Prep" />
                <Feature text="Get Lifetime Access to Updates" />
                <Feature text="Get a Certificate of Completion" />
              </ul>
            </div>

            <div className="mt-8 p-4 bg-neutral-700/30 border border-neutral-600 rounded-lg">
              <p className="flex items-center text-white/80">
                <svg
                  className="w-5 h-5 mr-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Join thousands of developers who have transformed their careers
                building SaaS products.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        .card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: translateX(-100%);
          opacity: 0;
          transition: opacity 0.1s;
        }

        .card:hover::after {
          animation: shine 1s ease-in-out;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Pricing;
