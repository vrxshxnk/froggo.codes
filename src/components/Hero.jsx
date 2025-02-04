import Image from "next/image";
// import config from "@/config";

const Hero = () => {
  return (
    // Adjusted classes for extra large screens: increased gap, reduced padding and margins
    <div className="align-middle">
      <div
        id="about"
        className="max-w-7xl xl:px-0 mx-auto bg-[#181818] flex flex-col display:block lg:flex-row items-center justify-center text-center gap-16 lg:gap-24 xl:gap-52 px-8 py-8 lg:px-6 lg:py-4 xl:py-4 lg:h-screen"
      >
        <div className="flex flex-col gap-10 lg:gap-16 xl:gap-18 lg:text-left lg:items-start items-center justify-center text-center">
          <h1 className="font-extrabold text-3xl lg:text-5xl xl:text-6xl text-white ">
            The Last Minute
            <br />
            <span className="leading-normal underline underline-offset-4 decoration-wavy decoration-emerald-400">
              Python
            </span>{" "}
            Bootcamp.
            {/* <span className="leading-normal underline underline-offset-4 decoration-solid decoration-red-400">
            In 30 DAYS.
          </span>{" "} */}
            {/* or{" "}
          <span className="leading-normal underline underline-offset-4 decoration-wavy decoration-green-400">
            SaaS
          </span>
          <br />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 leading-relaxed">
            in minutes
          </span> */}
            {/* ⏳ */}
          </h1>
          <p className="text-md lg:text-lg xl:text-xl text-white opacity-80 leading-snug">
            🧑🏻‍💻 Become Job Ready In 30 Days.
            <br />
            <br />
            🔥 Go from basics of Python to building full-stack apps.
            <br />
            <br />
            💪🏼 Learn from 10+ years of industry experience.{" "}
          </p>
          {/* Button removed */}
        </div>
        <div className="bg-[#181818] relative">
          <Image
            src="/bitmap10.svg"
            alt="Product Demo"
            className="w-400 h-400 sm:w-300 sm:h-300"
            priority={true}
            width={400}
            height={400}
          />
          <div className="text-emerald-200 pt-2">
            {" "}
            Build strong foundations for your career.{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
