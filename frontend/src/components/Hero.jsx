import { Link } from "react-router-dom";
import CowImg from "../assets/cow-img.png";

const Hero = () => {
  return (
    <section className="relative bg-transparent text-white px-6 py-20 flex flex-col md:flex-row items-center  overflow-hidden ml-7 lg:mb-25">
      {/* LEFT SIDE: Text content */}
      <div className="mt-20 relative z-10 w-full md:w-1/2 lg:w-full text-center md:text-left flex flex-col items-center md:items-start justify-center lg:-mt-5">
        <h1 className="text-4xl lg:text-7xl font-extrabold leading-tight lg:leading-[1.2] max-w-2xl sm:text-5xl lg:max-w-3xl">
          Experience financial stability, redefined hourly, daily, monthly.
        </h1>

        <p className="mt-6 text-gray-300 text-base sm:text-lg lg:text-xl max-w-md text-center md:text-left lg:max-w-2xl">
          Goldnest is an innovative company specializing in investments,
          offering consistent returns and steady financial growth. We combine
          technology, experience, and trust to help you build lasting wealth.
        </p>
        <Link to="/Register">
          <button className="mt-8 bg-yellow-500 text-black px-8 py-3 rounded-md font-medium hover:bg-yellow-400 transition cursor-pointer">
            Register
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
