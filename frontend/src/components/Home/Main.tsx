import React from "react";
import Shape from "../../assets/Shape.svg";
import { Link } from "../../router";
import PrimaryButton from "../ui/PrimaryButton";
import { getToken } from "../../lib/auth";

const Main = () => {
  const token = getToken();
  const destination = token ? "/dashboard" : "/login";

  return (
    <div className="pt-[8%] md:pt-[11%] pb-[6%] md:pb-[9%] relative px-4">
      <div className="hidden md:block absolute opacity-[0.02] left-[530px] top-[30px] animate-[spin_20s_linear_infinite]">
        <Link to="/">
          <img src={Shape} alt="shape" />
        </Link>
      </div>
      <h5 className="text-light opacity-50 pt-[100px] pb-4 md:pb-[20px] text-sm md:text-base lg:text-[18px] animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
        Master the Game with Just One Swing
      </h5>
      <h1 className="text-light text-2xl md:text-3xl lg:text-[45px] leading-[40px] md:leading-[60px] lg:leading-[90px] w-full md:w-[500px] lg:w-[580px] pb-6 md:pb-[45px] font-family[Questrial] animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
        One Swing to Rule the Table A Power Move to Conquer Every Rally.
      </h1>
      <div className="animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
        <Link to={destination}>
          <PrimaryButton data="Get Started" />
        </Link>
      </div>
      <div className="flex justify-start md:justify-end animate-[fadeInUp_0.8s_ease-out_0.8s_both]">
        <p className="text-light w-full md:w-[400px] lg:w-[444px] leading-[25px] md:leading-[30px] lg:leading-[35px] text-sm md:text-[16px]">
          Step up, take aim, and unleash your winning swing. Every shot is your
          chance to dominate the table, outplay your rivals, and claim victory
          in style.
        </p>
      </div>
    </div>
  );
};

export default Main;
