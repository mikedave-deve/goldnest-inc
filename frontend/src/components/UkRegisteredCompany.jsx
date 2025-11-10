import React from "react";
import UkMap from "../assets/map.png"; // placeholder for map pin logo
import UkCrest from "../assets/uk-crest.png"; // placeholder for royal crest logo

const UKRegisteredCompanySection = () => {
  return (
    <section className="w-full">
      <div className="flex flex-col lg:flex-row w-full">
        {/* LEFT BOX (Dark Section) */}
        <div className="bg-[#1a1a1a] text-white lg:w-[65%] w-full p-8 flex items-start space-x-6">
          <img
            src={UkMap}
            alt="UK Map Placeholder"
            className="w-20 h-20 object-contain"
          />
          <div>
            <h2 className="text-2xl font-bold text-[#fdc700] mb-2">
              Registered Company
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              goldnest-inc.com is a fully registered and licensed company in UK.
              goldnest-inc.com is powered by the latest and most secure form of
              SSL data encryption to keep all your data and information safe and secure.
            </p>
          </div>
        </div>

        {/* RIGHT BOX (Gold Section) */}
        <div className="bg-[#fdc700] text-gray-900 lg:w-[35%] w-full p-8 flex flex-col justify-center">
          <div className="flex flex-row items-center space-x-4 mb-6">
            {/* Crest Logo */}
            <img
              src={UkCrest}
              alt="Crest Placeholder"
              className="w-16 h-16 object-contain"
            />

            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-1">111223344</h3>
              <p className="uppercase text-sm tracking-wide">
                Official Registered Company
              </p>
            </div>
          </div>

          {/* Button */}
         <button
  className="bg-[#1a1a1a] text-white font-semibold px-8 py-3 rounded w-full 
  cursor-pointer transition-colors duration-300 hover:bg-gray-400 hover:text-black"
>
  CHECK COMPANIES HOUSE
</button>
        </div>
      </div>
    </section>
  );
};

export default UKRegisteredCompanySection;