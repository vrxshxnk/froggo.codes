const Step = ({ emoji, text }) => {
  return (
    <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="font-bold">{text}</h3>
    </div>
  );
};

const Problem = () => {
  return (
    <section className="bg-neutral-800 text-white flex flex-col justify-center items-center">
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16 text-center">
        <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-4xl tracking-tight leading-normal mb-6 md:mb-16">
          Stop wasting your time while learning to code.
        </h2>

        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-green-400 max-w-4xl mx-auto font-extrabold text-4xl md:text-7xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
          Get A Jumpstart.
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 md:mb-8 mt-12">
          <Step emoji="🧱" text="Build REAL Projects." />

          <Step emoji="📈" text="Learn Best Practices." />

          <Step emoji="🚀" text="Lift-off to success." />

          {/* <Arrow extraStyle="md:-scale-x-100 md:-rotate-90" /> */}
        </div>
      </div>
    </section>
  );
};

export default Problem;
