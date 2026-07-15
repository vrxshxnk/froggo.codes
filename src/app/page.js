import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import RoadmapsPromo from "@/components/RoadmapsPromo";
import Features from "@/components/Features";
import Curriculum from "@/components/Curriculum";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import CallToAction from "@/components/CallToAction";
import CourseIntro from "@/components/CourseIntro";
import WaitlistModal from "@/components/WaitlistModal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-[#181818] flex flex-col min-h-screen">
      <Suspense>
        <Header />
      </Suspense>
      <div>
        <Hero />
        <Problem />
        <RoadmapsPromo />
        <Features />
        <Curriculum />
        <Pricing />
        <FAQ />
        <CallToAction />
        <CourseIntro />
      </div>
      <WaitlistModal />
      <Footer />
    </main>
  );
}
