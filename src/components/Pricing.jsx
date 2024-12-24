const Step = ({ emoji, text }) => {
  return (
    <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="font-bold">{text}</h3>
    </div>
  );
};

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="bg-neutral-800 text-white flex flex-col justify-center items-center"
    >
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16 text-center">
        <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-4xl tracking-tight leading-normal mb-6 md:mb-16">
          50% OFF for the first 100 students.
        </h2>

        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 max-w-4xl mx-auto font-extrabold text-4xl md:text-7xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
          Rs. 1,999/-
        </h2>
        {/* 
        <h4 className="text-white bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 max-w-4xl mx-auto font-extrabold text-2xl md:text-4xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
          ONLY.
        </h4> */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 md:mb-8 mt-12">
          <Step emoji="🗓️" text="Practice Every Day." />

          <Step emoji="🏋🏼" text="Build Strong Career Foundations." />

          <Step emoji="🎖️" text="Get Ahead of Your Peers." />

          {/* <Arrow extraStyle="md:-scale-x-100 md:-rotate-90" /> */}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
