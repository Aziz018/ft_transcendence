// import { ArrowRightIcon } from "lucide-react";
import Fuego from "../../../index";
// import { Separator } from "../../../../components/ui/separator";
import StarsFilled from "../../../assets/stars_filled.svg";
import Logo from "../../../assets/secondLogo.svg";
import ArrowSvg from "../../../assets/arrow.svg";

import React from "react";
import { Link } from "../../../library/Router/Router";

const PingPongShowcaseSection = () => {
  return (
    <div>
      <section className="w-full relative pt-[100px]">
        <div className="flex items-center  gap-[188px]">
          <div className="flex flex-col gap-2">
            <div>
              <img alt="Stars filled" src={StarsFilled} />
            </div>
            <div className="pt-2">
              <h2 className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-4xl tracking-[0] leading-[50px] whitespace-nowrap">
                My Ping Pong <br /> Evolution
              </h2>
            </div>
          </div>

          {/* <Separator orientation="vertical" className="h-[58px] bg-white/20" /> */}

          <div className="flex flex-col gap-[22px]">
            <p className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px] whitespace-nowrap">
              You&apos;ve earned – keep going!
            </p>
            <p className="pt-3 font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-5xl tracking-[0] leading-[15px] whitespace-nowrap">
              1,255xp
            </p>
          </div>

          {/* <Separator orientation="vertical" className="h-[58px] bg-white/20" /> */}

          <Link
            to="/leaderboard"
            className="flex items-center gap-2 [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-[18px] tracking-[0] leading-[15px] underline whitespace-nowrap">
            View Full Leaderboard
            <img src={ArrowSvg} alt="arrow right icon" className="w-4 h-4" />
            {/* <ArrowRightIcon className="w-4 h-4" /> */}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PingPongShowcaseSection;
