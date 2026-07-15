const Feature = ({ emoji, text }) => {
    return (
        <div className="w-full md:w-52 flex flex-col gap-2 items-center justify-center">
            <span className="text-5xl">{emoji}</span>
            <h3 className="font-bold text-lg">{text}</h3>
        </div>
    );
};

const CallToAction = () => {
    return (
        <section className="bg-neutral-800 text-white flex flex-col justify-center items-center">
            <div className="max-w-7xl mx-auto px-8 py-12 md:py-20 text-center">
                <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-5xl tracking-tight leading-normal mb-6 md:mb-10">
                    Get To Us{" "}
                    {/* <span className="px-1 bg-gradient-to-b from-green-400 to-cyan-500 text-transparent bg-clip-text">
                        us
                    </span> */}
                </h2>

                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-teal-400 to-green-300 max-w-5xl mx-auto font-extrabold text-4xl md:text-6xl tracking-tight leading-tight mb-8 md:mb-16">
                    Before Your Competition Does.
                </h2>

                <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 md:gap-16 mb-12 mt-12">
                    <Feature emoji="⏰" text="Limited Time Pricing" />
                    <Feature emoji="🎯" text="Industry-Ready Skills" />
                    <Feature emoji="🔥" text="Be the First Mover" />
                </div>

                <a
                    href="#pricing"
                    className="inline-block px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    Start Learning Today
                </a>

                <p className="mt-6 text-neutral-400 text-sm">
                    Join 200+ students already on their way to success
                </p>
            </div>
        </section>
    );
};

export default CallToAction;
