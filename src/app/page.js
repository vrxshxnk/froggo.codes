import Waitlist from "@/components/Waitlist";

// import Image from "next/image";
// import { Suspense } from "react";
// import Header from "@/components/Header";
// import Hero from "@/components/Hero";
// import Problem from "@/components/Problem";
// import Features from "@/components/Features";
// import FAQ from "@/components/FAQ";
// import Pricing from "@/components/Pricing";
// import CallToAction from "@/components/CallToAction";
// import CourseIntro from "@/components/CourseIntro";
// import Footer from "@/components/Footer";

export default function Home() {
  // Pre-launch waitlist takeover. To restore the full site, swap the return
  // statements below (delete the Waitlist line, uncomment the original block,
  // and uncomment the imports above).
  return <Waitlist />;

  // return (
  //   <>
  //     <main className="bg-[#181818] flex flex-col min-h-screen">
  //       <Suspense>
  //         <Header />
  //       </Suspense>
  //       <div>
  //         <Hero />
  //         <Problem />
  //         <Features />
  //         <Pricing />
  //         <FAQ />
  //         <CallToAction />
  //         <CourseIntro />
  //         {/*
  //         <Contact /> Use the Contact component */}
  //       </div>
  //       <Footer />
  //     </main>
  //   </>
  // );
}
