import Image from "next/image";
import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="bg-[#181818] flex flex-col min-h-screen">
        <Suspense>
          <Header />
        </Suspense>
        <div>
          <Hero />
          <Problem />
          <Features />
          <Pricing />
          <FAQ />
          {/* 
          <Contact /> Use the Contact component */}
        </div>
        <Footer />
      </main>
    </>
  );
}
