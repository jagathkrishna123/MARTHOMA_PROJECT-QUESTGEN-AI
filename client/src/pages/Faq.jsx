import React, { useState } from "react";

const faqData = [
  {
    question: "What is NoteGen AI?",
    answer:
      "NoteGen AI is an AI-powered tool that helps you generate notes, summaries, and explanations from any topic or content.",
    emoji: "🤖",
  },
  {
    question: "Is NoteGen AI free to use?",
    answer:
      "Yes, NoteGen AI offers a free version with basic features. Premium features may be added in the future.",
    emoji: "✨",
  },
  {
    question: "Can I download the generated notes?",
    answer:
      "Yes, you can copy or download the generated notes for personal or educational use.",
    emoji: "📥",
  },
  {
    question: "How do I create a question paper?",
    answer:
      "You can upload a PDF syllabus or enter plain text. The AI will read the content, extract the important topics, and automatically generate a question paper based on those topics.",
    emoji: "📝",
  },
  {
    question: "What topics can I generate notes for?",
    answer:
      "You can generate notes for any subject including programming, science, history, business, and more.",
    emoji: "📚",
  },
  {
    question: "Does NoteGen AI store my data?",
    answer:
      "Your data is handled securely. Only necessary information is stored to improve performance and user experience.",
    emoji: "🔒",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-indigo-100 mb-5">
            FAQ
          </span>
          <h2 className="text-4xl font-bold text-gray-700 leading-tight tracking-tight mb-3">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Everything you need to know about NoteGen AI.
          </p>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {faqData.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`transition-colors duration-200 ${
                  isOpen ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Question Row */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-base flex-shrink-0 transition-colors duration-200 ${
                    isOpen ? "bg-indigo-100" : "bg-gray-100"
                  }`}>
                    {faq.emoji}
                  </span>

                  <span className={`flex-1 text-base font-semibold transition-colors duration-200 ${
                    isOpen ? "text-indigo-700" : "text-gray-800"
                  }`}>
                    {faq.question}
                  </span>

                  <span className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 border transition-all duration-300 ${
                    isOpen
                      ? "bg-indigo-600 border-indigo-600 rotate-180"
                      : "bg-white border-gray-200"
                  }`}>
                    <svg
                      className={`w-3.5 h-3.5 transition-colors duration-200 ${
                        isOpen ? "text-white" : "text-gray-400"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="pl-20 pr-6 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-gray-800 text-sm font-semibold">Still have questions?</p>
              <p className="text-gray-400 text-xs mt-0.5">Our team is happy to help you out.</p>
            </div>
          </div>
          <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors duration-200 whitespace-nowrap">
            Contact us →
          </button>
        </div>

      </div>
    </section>
  );
};

export default Faq;