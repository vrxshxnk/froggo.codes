"use client";

import { useRef, useState } from "react";

const faqList = [
  //   {
  //     question: "What even is a boilerplate?",
  //     answer: (
  //       <div className="space-y-2 leading-relaxed">
  //         When working on a project, there are a million repetitive tasks, like
  //         setting up authentication, database, email, contact, etc. A boilerplate
  //         offers all of these features out of the box, so you only have to work on
  //         your product.
  //       </div>
  //     ),
  //   },
  //   {
  //     question: "Why MinuteShip?",
  //     answer: (
  //       <div className="space-y-2 leading-relaxed">
  //         MinuteShip offers aesthetic, simple to use, and high quality boilerplate
  //         at the best price. Our features make it perfect for anyone to ship their
  //         product ASAP.
  //       </div>
  //     ),
  //   },
  {
    question: "Why You?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        The instructor has experience of 10+ years in the industry and mentored
        200+ students, who have gotten placed at prestigious companies. The
        pacing is perfect for beginners and we take it from the very basics. The
        videos aren't compressed to reduce the syllabus, most things you need at
        your first job are covered, and you learn not just coding, but also
        skills to apply for a job, like taking an interview, or building a
        resume.{" "}
      </div>
    ),
  },
  {
    question: "Till when can I use the product?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Once you buy the course, you own it forever.{" "}
      </div>
    ),
  },
  {
    question: "What's in the pipeline?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        If there is any update to the tech you learn, we will promptly update
        the tutorials too. Our stack changes from time to time reflecting the
        current job trends as well.
      </div>
    ),
  },
  {
    question: "What will I learn?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        You'll learn full-stack development using Python, Django, HTML, CSS,
        etc. For more refer to the syllabus section above!
      </div>
    ),
  },
  {
    question: "What's expected of the learner?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        You are expected to finish the videos, and do the assignments on each
        day. In each video, the instructor points out some things you need to
        practice on your own, and some things to look further into.
      </div>
    ),
  },
  {
    question: "Can I get a refund?",
    answer: (
      <p>
        Due to the downloadable nature of the product, we do not offer refunds.
        However, if you are not satisfied with the product, please contact us
        and we will try to resolve the issue.
      </p>
    ),
  },
  {
    question: "Who is it for?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        If you want to learn how to code from scratch, or want a quick refresher
        before your placements or interviews, build up practice, this course is
        for EVERYONE.
      </div>
    ),
  },
  {
    question: "I have another question",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Feel free to contact us whenever you wish, and we'll be there to help:
        <br />
        hi@froggo.codes
      </div>
    ),
  },
];

const FaqItem = ({ item, isOpen, onClick }) => {
  const accordion = useRef(null);

  return (
    <li className="px-8">
      <button
        className="relative flex gap-2 items-center w-full py-5 text-white font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${
            isOpen ? "text-white" : "text-white"
          }`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen ? "rotate-180 hidden" : ""
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight + "px", opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 text-white leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const midpoint = Math.ceil(faqList.length / 2);
  const firstHalf = faqList.slice(0, midpoint);
  const secondHalf = faqList.slice(midpoint);

  return (
    <section className="bg-[#181818] py-24 px-8 lg:px-4" id="faq">
      <h2 className="max-w-4xl mx-auto text-center font-extrabold text-4xl md:text-6xl tracking-tighter leading-normal mb-6 md:mb-10">
        <span className="leading-loose text-center text-5xl"> 🤷🏻‍♀️ 🤷🏻‍♂️ 🤷🏾‍♀️ </span>
        <br />
        <span className="bg-gradient-to-tr text-center text-white from-green-400 to-cyan-500 px-2">
          {" "}
          Frequently Asked Questions{" "}
        </span>
      </h2>
      <div className="flex flex-col max-w-7xl lg:gap-24 mx-auto md:flex-row md:w-1/2 text-center justify-center items-center">
        <ul className="w-full md:w-1/2 text-wrap text-center text-white">
          {firstHalf.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onClick={() => handleClick(i)}
            />
          ))}
        </ul>
        <ul className="w-full md:w-1/2 text-wrap text-center text-white">
          {secondHalf.map((item, i) => (
            <FaqItem
              key={i + midpoint}
              item={item}
              isOpen={openIndex === i + midpoint}
              onClick={() => handleClick(i + midpoint)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
