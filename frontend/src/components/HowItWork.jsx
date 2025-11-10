import React from "react";

const steps = [
  {
    number: "Step 1",
    title: "Create account",
    description: `Open a free account with Goldnest by simply clicking on "Register". 
Complete the form and click submit. Your account with Goldnest will be active.`,
  },
  {
    number: "Step 2",
    title: "Make deposit",
    description: `Log in to your account by clicking on "User's area" button. After that, you can click on "Deposit" button in dashboard, select a payment system and amount of your deposit and pay. Deposit will be created automatically.`,
  },
  {
    number: "Step 3",
    title: "Withdraw profit",
    description: `When you will receive your first accrual, you can withdraw it without any problem. Just click the "Withdraw" button in dashboard, select the payment system, fill amount field and create withdrawal request.`,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="bg-black text-white py-16 px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-2">
          How it works
        </h2>
        <p className="text-gray-300 text-base lg:text-lg">
          At every step, Goldnest provides you with an affordable and easy-to-use way even for beginners.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 text-center lg:text-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center  lg:text-center">
            <h3
  className="relative text-yellow-400 font-bold text-lg mb-2 lg:text-center cursor-pointer
  after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0
  after:w-0 after:h-[2px] after:bg-yellow-400 after:transition-all after:duration-300
  hover:after:w-full hover:text-yellow-300"
>
  {step.number}
</h3>

            <h4 className="text-xl font-semibold mb-2 lg:text-center">{step.title}</h4>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
