import React from "react";
import ReferralLogo from "../assets/referral.png"

const ReferralSection = () => {
  return (
    <section className="bg-black text-white py-25 px-4 relative">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-between relative">
        {/* Left Content */}
        <div className=" text-center  lg:text-left">
          <h2 className="text-3xl lg:text-4xl text-center font-extrabold text-yellow-400 mb-2 lg:ml-75">
            Referral Commission
          </h2>
          <p className="text-gray-300 text-base lg:text-lg mb-6 lg:text-center lg:ml-70">
           GoldNest affiliate program
          </p>

          <p className="text-gray-300 text-lg leading-relaxed mb-4 mt-15">
            At Goldnest, we believe that the best way to grow our business is
            through the recommendations of our satisfied clients. With this in
            mind, Goldnest has introduced a highly rewarding two-tier affiliate
            program designed to offer attractive incentives for those who share
            our services with others.
          </p>

          <p className="text-gray-300 text-lg leading-relaxed">
            Goldnest rewards individuals for helping to promote its investment
            program and anyone can participate. To earn rewards, simply invite
            your friends, family, and colleagues to join through your unique
            referral link. You can profit from our affiliate program and
            withdraw your referral earnings even if you don’t have an active
            deposit in the project.
          </p>
        </div>

        {/* Right Image Placeholder */}
        <div className="mt-15 lg:mt-0 lg:mt-20 flex justify-end lg:ml-25 ">
          <div className="w-40 h-40  rounded-full flex items-center justify-center">
           <img src={ReferralLogo} alt="Referral Program" className="w-40 h-40 object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
