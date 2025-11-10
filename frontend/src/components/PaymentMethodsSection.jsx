import React from "react";

// Placeholder images — replace with your actual image imports later
import PaypalIcon from "../assets/paypal.png";
import LiteCoinIcon from "../assets/Litecoin.png";
import EthereumIcon from "../assets/Ethereum.png";
import BitcoinIcon from "../assets/bitcoin-logo.png";
import PayeerIcon from "../assets/payeer.png";
import DogeCoinIcon from "../assets/dogecoin.png";

const paymentLogos = [
  { src: PaypalIcon, alt: "Paypal" },
  { src: LiteCoinIcon, alt: "LiteCoin" },
  { src: EthereumIcon, alt: "Ethereum" },
  { src: BitcoinIcon, alt: "Bitcoin" },
  { src: PayeerIcon, alt: "Payeer" },
  { src: DogeCoinIcon, alt: "Dogecoin" },
];

const PaymentMethodsSection = () => {
  return (
    <section className="bg-black py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {paymentLogos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-10 object-contain grayscale "
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsSection;
